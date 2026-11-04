<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'is_active', 'has_temporary_password', 'password_changed_at', 'created_at'])
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                    'is_active' => $user->is_active,
                    'is_current' => $user->is($request->user()),
                    'has_temporary_password' => $user->has_temporary_password,
                    'password_changed_at' => $user->password_changed_at?->toIso8601String(),
                    'created_at' => $user->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => null,
            'roles' => $this->roles(),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $user = User::query()->create($request->validated());
        $user->forceFill([
            'email_verified_at' => now(),
            'has_temporary_password' => true,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User account created.']);

        return to_route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => $user->only('id', 'name', 'email', 'role', 'is_active'),
            'roles' => $this->roles(),
        ]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        $password = $data['password'] ?? null;
        unset($data['password']);

        $user->update($data);

        if (filled($password)) {
            $user->is($request->user())
                ? $user->setOwnPassword($password)
                : $user->setTemporaryPassword($password);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User account updated.']);

        return to_route('admin.users.index');
    }

    /**
     * Replace the user's password with a random one, shown once to the administrator.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Change your own password from your account settings.']);

            return back();
        }

        $password = Str::password(12, symbols: false);

        $user->setRememberToken(Str::random(60));
        $user->setTemporaryPassword($password);
        $user->endSessions();

        Inertia::flash('generated_password', $password);

        return back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user()) || $user->isLastActiveAdmin()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'You cannot delete your own account or the only active administrator.']);

            return back();
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User account deleted.']);

        return to_route('admin.users.index');
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function roles(): array
    {
        return array_map(
            fn (UserRole $role): array => ['value' => $role->value, 'label' => $role->label()],
            UserRole::cases(),
        );
    }
}
