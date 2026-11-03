<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at'])
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                    'is_active' => $user->is_active,
                    'is_current' => $user->is($request->user()),
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
        $user->forceFill(['email_verified_at' => now()])->save();

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

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $user->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User account updated.']);

        return to_route('admin.users.index');
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
