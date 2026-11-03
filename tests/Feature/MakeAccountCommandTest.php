<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('it creates an active administrator account', function () {
    $this->artisan('make:account')
        ->expectsQuestion('Full name', 'Maria Santos')
        ->expectsQuestion('Email address', 'Maria@CHED.gov.ph')
        ->expectsQuestion('Password', 'secret-password')
        ->expectsQuestion('Confirm password', 'secret-password')
        ->expectsOutputToContain('Administrator account for maria@ched.gov.ph created.')
        ->assertSuccessful();

    $user = User::query()->sole();

    expect($user->name)->toBe('Maria Santos')
        ->and($user->email)->toBe('maria@ched.gov.ph')
        ->and($user->role)->toBe(UserRole::Admin)
        ->and($user->is_active)->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(Hash::check('secret-password', $user->password))->toBeTrue();
});

test('invalid or already registered emails are rejected', function (string $email, string $error) {
    User::factory()->create(['email' => 'taken@ched.gov.ph']);

    // Outside tests the prompt asks again; under test Laravel stops at the first invalid answer.
    $this->artisan('make:account')
        ->expectsQuestion('Full name', 'Maria Santos')
        ->expectsQuestion('Email address', $email)
        ->expectsOutputToContain($error)
        ->assertFailed();

    expect(User::query()->count())->toBe(1);
})->with([
    'invalid' => ['not-an-email', 'The email field must be a valid email address.'],
    'taken' => ['Taken@CHED.gov.ph', 'The email has already been taken.'],
]);

test('mismatched password confirmations are rejected', function () {
    $this->artisan('make:account')
        ->expectsQuestion('Full name', 'Maria Santos')
        ->expectsQuestion('Email address', 'maria@ched.gov.ph')
        ->expectsQuestion('Password', 'secret-password')
        ->expectsQuestion('Confirm password', 'different-password')
        ->expectsOutputToContain('The passwords do not match.')
        ->assertFailed();

    expect(User::query()->count())->toBe(0);
});
