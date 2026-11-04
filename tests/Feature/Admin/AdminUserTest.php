<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Support\SessionKey;

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
        ->and($user->is_active)->toBeTrue()
        ->and($user->has_temporary_password)->toBeTrue();
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

test('administrators can reset another user\'s password to a random one', function () {
    config(['session.driver' => 'database']);
    $editor = User::factory()->create();
    DB::table('sessions')->insert([
        'id' => 'editor-session',
        'user_id' => $editor->id,
        'payload' => '',
        'last_activity' => now()->getTimestamp(),
    ]);

    $response = $this->actingAs(User::factory()->admin()->create())
        ->from(route('admin.users.index'))
        ->post(route('admin.users.reset-password', $editor));

    $response->assertRedirect(route('admin.users.index'))
        ->assertInertiaFlash('generated_password');
    $generatedPassword = session(SessionKey::FLASH_DATA)['generated_password'];
    expect($generatedPassword)->toHaveLength(12)
        ->and(Hash::check($generatedPassword, $editor->fresh()->password))->toBeTrue()
        ->and(Hash::check('password', $editor->fresh()->password))->toBeFalse()
        ->and($editor->fresh()->has_temporary_password)->toBeTrue();
    $this->assertDatabaseMissing('sessions', ['user_id' => $editor->id]);
});

test('administrators cannot reset their own password from user management', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('admin.users.index'))
        ->post(route('admin.users.reset-password', $admin))
        ->assertRedirect(route('admin.users.index'))
        ->assertInertiaFlashMissing('generated_password');

    expect(Hash::check('password', $admin->fresh()->password))->toBeTrue();
});

test('editors cannot reset passwords', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.users.reset-password', $admin))
        ->assertForbidden();

    expect(Hash::check('password', $admin->fresh()->password))->toBeTrue();
});

test('a password set by an administrator is temporary unless it is their own', function (bool $isOwnAccount, bool $expectedTemporary) {
    $admin = User::factory()->admin()->create();
    $user = $isOwnAccount ? $admin : User::factory()->create();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'is_active' => '1',
            'password' => 'chosen-password-1',
            'password_confirmation' => 'chosen-password-1',
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh())
        ->has_temporary_password->toBe($expectedTemporary)
        ->and(Hash::check('chosen-password-1', $user->fresh()->password))->toBeTrue();
})->with([
    'another user' => [false, true],
    'own account' => [true, false],
]);
