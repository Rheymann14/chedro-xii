<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\SiteCounter;
use App\Models\User;

function pageVisitorCount(string $path): int
{
    return SiteCounter::query()->where('key', SiteCounter::pageVisitorsKey($path))->value('value') ?? 0;
}

test('each page counts its own visitors', function () {
    $this->get(route('home'))->assertOk();
    $this->get(route('announcements.index'))->assertOk();

    $this->postJson(route('page-views.store'), ['path' => '/'])->assertOk();
    $this->postJson(route('page-views.store'), ['path' => '/announcements'])->assertOk();

    expect(pageVisitorCount('/'))->toBe(1)
        ->and(pageVisitorCount('/announcements'))->toBe(1);
});

test('a page is counted once per browsing session', function () {
    $this->get(route('home'))->assertOk();
    $this->postJson(route('page-views.store'), ['path' => '/'])->assertOk();
    $this->get(route('home'))->assertOk();

    $this->postJson(route('page-views.store'), ['path' => '/'])
        ->assertOk()
        ->assertJson(['count' => 1]);
});

test('a prefetched page is counted when it is shown', function () {
    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) app(HandleInertiaRequests::class)->version(request()),
        'Purpose' => 'prefetch',
    ])
        ->get(route('announcements.index'))
        ->assertOk();

    expect(pageVisitorCount('/announcements'))->toBe(0);

    $this->postJson(route('page-views.store'), ['path' => '/announcements'])
        ->assertOk()
        ->assertJson(['count' => 1]);
});

test('the count and start date of the page are returned', function () {
    SiteCounter::factory()->create([
        'key' => SiteCounter::pageVisitorsKey('/announcements'),
        'value' => 41,
        'created_at' => '2026-01-15 08:00:00',
    ]);
    $this->get(route('announcements.index'))->assertOk();

    $this->postJson(route('page-views.store'), ['path' => '/announcements'])
        ->assertOk()
        ->assertExactJson(['count' => 42, 'since' => '2026-01-15']);
});

test('pages not served to the session are not counted', function () {
    $this->postJson(route('page-views.store'), ['path' => '/made-up-page'])
        ->assertOk()
        ->assertExactJson(['count' => 0, 'since' => null]);

    $this->assertDatabaseCount('site_counters', 0);
});

test('crawlers are not counted', function () {
    $this->withHeader('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1)')
        ->get(route('home'))
        ->assertOk();

    $this->postJson(route('page-views.store'), ['path' => '/'])->assertOk();

    expect(pageVisitorCount('/'))->toBe(0);
});

test('signed-in staff are not counted', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertOk();

    $this->postJson(route('page-views.store'), ['path' => '/'])->assertOk();

    expect(pageVisitorCount('/'))->toBe(0);
});

test('the path must be a site path', function () {
    $this->postJson(route('page-views.store'), ['path' => 'https://example.com'])
        ->assertJsonValidationErrors(['path' => 'The path field must start with one of the following: /.']);
});
