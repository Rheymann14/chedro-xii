<?php

use App\Enums\UserRole;
use App\Models\User;

test('administrators can create editor accounts', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.users.store'), [
            'name' => 'Maria Santos',
            'email' => 'maria@ched.gov.ph',
            'role' => UserRole::Editor->value,
            'is_active' => '1',
            'password' => 'password-123',
            'password_confirmation' => 'password-123',
        ])
        ->assertRedirect(route('admin.users.index'));

    $user = User::query()->where('email', 'maria@ched.gov.ph')->sole();

    expect($user->role)->toBe(UserRole::Editor)
        ->and($user->is_active)->toBeTrue();
});

test('the only active administrator cannot be demoted or deactivated', function (array $changes) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => UserRole::Admin->value,
            'is_active' => '1',
            ...$changes,
        ])
        ->assertSessionHasErrors(['role' => 'This is the only active administrator. Promote another administrator first.']);

    expect($admin->fresh())
        ->role->toBe(UserRole::Admin)
        ->is_active->toBeTrue();
})->with([
    'demoted' => [['role' => UserRole::Editor->value]],
    'deactivated' => [['is_active' => '0']],
]);

test('an administrator can be demoted when another is active', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $other), [
            'name' => $other->name,
            'email' => $other->email,
            'role' => UserRole::Editor->value,
            'is_active' => '1',
        ])
        ->assertSessionHasNoErrors();

    expect($other->fresh()->role)->toBe(UserRole::Editor);
});

test('administrators cannot delete their own account from user management', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->admin()->create();

    $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));

    $this->assertModelExists($admin);
});

test('the only active administrator cannot delete their account from settings', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertSessionHasErrors('password');

    $this->assertModelExists($admin);
});
