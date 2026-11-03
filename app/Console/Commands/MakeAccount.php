<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

#[Signature('make:account')]
#[Description('Create an administrator account for the back office')]
class MakeAccount extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = text(
            label: 'Full name',
            required: true,
            validate: fn (string $value): ?string => $this->firstError('name', $value, ['string', 'max:255']),
        );

        $email = mb_strtolower(text(
            label: 'Email address',
            required: true,
            validate: fn (string $value): ?string => $this->firstError('email', mb_strtolower($value), [
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ]),
        ));

        $password = password(
            label: 'Password',
            required: true,
            validate: fn (string $value): ?string => $this->firstError('password', $value, [Password::defaults()]),
        );

        password(
            label: 'Confirm password',
            required: true,
            validate: fn (string $value): ?string => $value === $password ? null : 'The passwords do not match.',
        );

        $user = User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => UserRole::Admin,
            'is_active' => true,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        $this->components->info("Administrator account for {$user->email} created. You can now sign in at ".route('login').'.');

        return self::SUCCESS;
    }

    /**
     * Validate a single prompt answer and return its first error, if any.
     *
     * @param  array<int, mixed>  $rules
     */
    private function firstError(string $attribute, string $value, array $rules): ?string
    {
        return Validator::make([$attribute => $value], [$attribute => $rules])
            ->errors()
            ->first($attribute) ?: null;
    }
}
