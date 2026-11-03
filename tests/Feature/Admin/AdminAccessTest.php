<?php

use App\Models\User;
use Illuminate\Support\Facades\Gate;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.posts.index'))->assertRedirect(route('login'));
});

test('editors manage content but not administration', function () {
    $editor = User::factory()->create();

    expect(Gate::forUser($editor)->allows('manage-content'))->toBeTrue()
        ->and(Gate::forUser($editor)->allows('administer'))->toBeFalse();
});

test('administrators can do everything', function () {
    $admin = User::factory()->admin()->create();

    expect(Gate::forUser($admin)->allows('manage-content'))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('administer'))->toBeTrue();
});

test('deactivated accounts lose all permissions', function () {
    $admin = User::factory()->admin()->inactive()->create();

    expect(Gate::forUser($admin)->allows('manage-content'))->toBeFalse()
        ->and(Gate::forUser($admin)->allows('administer'))->toBeFalse();
});

test('editors are refused administration pages', function (string $route) {
    $this->actingAs(User::factory()->create())
        ->get(route($route))
        ->assertForbidden();
})->with([
    'admin.users.index',
    'admin.menu-items.index',
    'admin.messages.index',
    'admin.settings.edit',
]);

test('editors can open content pages', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.posts.index'))
        ->assertOk();
});
