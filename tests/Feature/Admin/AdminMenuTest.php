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

test('menu links can be dragged to a new position among their siblings', function () {
    $first = MenuItem::factory()->create(['sort_order' => 0]);
    $second = MenuItem::factory()->create(['sort_order' => 1]);
    $third = MenuItem::factory()->create(['sort_order' => 2]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.menu-items.move', $third), ['position' => 0])
        ->assertRedirect();

    expect($third->fresh()->sort_order)->toBe(0)
        ->and($first->fresh()->sort_order)->toBe(1)
        ->and($second->fresh()->sort_order)->toBe(2);
});

test('moving a menu link past the end places it last', function () {
    $first = MenuItem::factory()->create(['sort_order' => 0]);
    $second = MenuItem::factory()->create(['sort_order' => 1]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.menu-items.move', $first), ['position' => 99])
        ->assertRedirect();

    expect($second->fresh()->sort_order)->toBe(0)
        ->and($first->fresh()->sort_order)->toBe(1);
});

test('child menu links can be dragged under another parent', function () {
    $about = MenuItem::factory()->create(['sort_order' => 0]);
    $news = MenuItem::factory()->create(['sort_order' => 1]);
    $mandate = MenuItem::factory()->create(['parent_id' => $about->id, 'sort_order' => 0]);
    $announcements = MenuItem::factory()->create(['parent_id' => $news->id, 'sort_order' => 0]);
    $careers = MenuItem::factory()->create(['parent_id' => $news->id, 'sort_order' => 1]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.menu-items.move', $announcements), ['position' => 0, 'parent_id' => $about->id])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($announcements->fresh())
        ->parent_id->toBe($about->id)
        ->sort_order->toBe(0)
        ->and($mandate->fresh()->sort_order)->toBe(1)
        ->and($careers->fresh()->parent_id)->toBe($news->id);
});

test('top-level menu links cannot be dragged under another link', function () {
    $about = MenuItem::factory()->create(['sort_order' => 0]);
    $news = MenuItem::factory()->create(['sort_order' => 1]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.menu-items.move', $news), ['position' => 0, 'parent_id' => $about->id])
        ->assertSessionHasErrors('parent_id');

    expect($news->fresh()->parent_id)->toBeNull();
});

test('guests cannot change menus', function () {
    $this->post(route('admin.menu-items.store'), [
        'menu' => MenuLocation::Header->value,
        'label' => 'Hijacked',
        'url' => 'https://evil.example',
    ])->assertRedirect(route('login'));

    expect(MenuItem::query()->count())->toBe(0);
});
