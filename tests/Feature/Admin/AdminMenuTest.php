<?php

use App\Enums\MenuLocation;
use App\Models\MenuItem;
use App\Models\User;
use App\Support\SiteMenus;

test('administrators can add a menu link and the cached menu is refreshed', function () {
    SiteMenus::all();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.menu-items.store'), [
            'menu' => MenuLocation::QuickLinks->value,
            'label' => 'UniFAST',
            'url' => 'https://unifast.gov.ph',
            'opens_in_new_tab' => '1',
        ])
        ->assertSessionHasNoErrors();

    expect(SiteMenus::for(MenuLocation::QuickLinks))->toHaveCount(1)
        ->and(SiteMenus::for(MenuLocation::QuickLinks)[0]['label'])->toBe('UniFAST');
});

test('menu links must use a safe scheme', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.menu-items.store'), [
            'menu' => MenuLocation::Header->value,
            'label' => 'Bad link',
            'url' => 'javascript:alert(1)',
        ])
        ->assertSessionHasErrors('url');

    expect(MenuItem::query()->count())->toBe(0);
});

test('menu links can be moved up among their siblings', function () {
    $first = MenuItem::factory()->create(['sort_order' => 0]);
    $second = MenuItem::factory()->create(['sort_order' => 1]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.menu-items.move', $second), ['direction' => 'up'])
        ->assertRedirect();

    expect($second->fresh()->sort_order)->toBe(0)
        ->and($first->fresh()->sort_order)->toBe(1);
});

test('guests cannot change menus', function () {
    $this->post(route('admin.menu-items.store'), [
        'menu' => MenuLocation::Header->value,
        'label' => 'Hijacked',
        'url' => 'https://evil.example',
    ])->assertRedirect(route('login'));

    expect(MenuItem::query()->count())->toBe(0);
});
