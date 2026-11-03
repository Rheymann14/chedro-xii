<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('administer') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var User|null $user */
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'role' => ['required', Rule::enum(UserRole::class)],
            'is_active' => ['boolean'],
            'password' => [$user === null ? 'required' : 'nullable', 'string', Password::default(), 'confirmed'],
        ];
    }

    /**
     * Keep at least one active administrator so the back office can never be
     * locked out.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var User|null $user */
                $user = $this->route('user');

                $demoted = $this->input('role') !== UserRole::Admin->value || ! $this->boolean('is_active');

                if ($user !== null && $demoted && $user->isLastActiveAdmin()) {
                    $validator->errors()->add('role', 'This is the only active administrator. Promote another administrator first.');
                }
            },
        ];
    }
}
