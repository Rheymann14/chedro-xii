<?php

use App\Models\SiteCounter;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function visitorCount(): int
{
    return SiteCounter::query()->where('key', SiteCounter::VISITORS)->value('value') ?? 0;
}

test('a browsing session is counted once', function () {
    $this->get(route('home'))->assertOk();
    $this->get(route('announcements.index'))->assertOk();

    expect(visitorCount())->toBe(1);
});

test('the visitor count is shared with public pages', function () {
    SiteCounter::factory()->create(['key' => SiteCounter::VISITORS, 'value' => 41]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('site.visitors.count', 42));
});

test('crawlers are not counted', function () {
    $this->withHeader('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1)')
        ->get(route('home'))
        ->assertOk();

    expect(visitorCount())->toBe(0);
});

test('signed-in staff are not counted', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertOk();

    expect(visitorCount())->toBe(0);
});
