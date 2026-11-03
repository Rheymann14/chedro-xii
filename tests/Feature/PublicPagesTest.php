<?php

use App\Enums\MenuLocation;
use App\Enums\PostType;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\User;
use App\Support\SiteSettings;
use Inertia\Testing\AssertableInertia as Assert;

test('the home page shares the site navigation and office settings', function () {
    MenuItem::factory()->create(['menu' => MenuLocation::Header, 'label' => 'Announcements', 'url' => '/announcements']);
    SiteSettings::update(['email' => 'records@chedro12.test']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('site.settings.email', 'records@chedro12.test')
            ->where('site.menus.header.0.label', 'Announcements')
            ->missing('issuances'));
});

test('the home page timeline lists the latest published posts of every type', function () {
    $career = Post::factory()->ofType(PostType::Career)->create(['published_at' => now()->subDay()]);
    $award = Post::factory()->ofType(PostType::Award)->create(['published_at' => now()->subHour()]);
    Post::factory()->draft()->create();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('timeline.data', 2)
            ->where('timeline.data.0.id', $award->id)
            ->where('timeline.data.1.id', $career->id));
});

test('the home page timeline shows six posts per page', function () {
    $posts = Post::factory()
        ->count(7)
        ->sequence(fn ($sequence) => ['published_at' => now()->subDays($sequence->index + 1)])
        ->create();

    $this->get(route('home', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('timeline.data', 1)
            ->where('timeline.data.0.id', $posts->last()->id)
            ->where('timeline.meta.per_page', 6)
            ->where('timeline.meta.last_page', 2));
});

test('a hub page lists the children of its main navigation item', function () {
    $about = MenuItem::factory()->create(['menu' => MenuLocation::Header, 'label' => 'About', 'url' => '/about']);
    MenuItem::factory()->create(['menu' => MenuLocation::Header, 'parent_id' => $about->id, 'label' => 'Mandate', 'url' => '/pages/mandate']);

    $this->get(route('hubs.show', 'about'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/hub')
            ->where('hub.label', 'About')
            ->where('hub.children.0.label', 'Mandate'));
});

test('a hub page without a matching navigation item is not found', function () {
    $this->get(route('hubs.show', 'hemis'))->assertNotFound();
});

test('published static pages are shown', function () {
    $page = Page::factory()->create(['slug' => 'mandate', 'title' => 'Mandate']);

    $this->get(route('pages.show', $page))
        ->assertOk()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->component('public/page')
            ->where('page.title', 'Mandate'));
});

test('unpublished static pages are hidden from guests but visible to staff', function () {
    $page = Page::factory()->create(['is_published' => false]);

    $this->get(route('pages.show', $page))->assertNotFound();

    $this->actingAs(User::factory()->create())
        ->get(route('pages.show', $page))
        ->assertOk();
});

test('the sitemap lists published pages', function () {
    $page = Page::factory()->create(['slug' => 'citizens-charter']);

    $this->get(route('sitemap'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml')
        ->assertSee(route('pages.show', $page), escape: false);
});
