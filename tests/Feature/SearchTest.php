<?php

use App\Enums\MenuLocation;
use App\Models\MenuItem;
use App\Models\Page;
use Inertia\Testing\AssertableInertia as Assert;

test('search finds built-in sections from the site menus', function () {
    $about = MenuItem::factory()->create(['label' => 'About', 'url' => '/about']);
    MenuItem::factory()->create([
        'parent_id' => $about->id,
        'label' => 'Higher Education Institutions',
        'url' => '/heis',
        'description' => 'Directory of recognized institutions.',
    ]);
    MenuItem::factory()->create(['menu' => MenuLocation::Footer, 'label' => 'Contact Us', 'url' => '/contact']);
    MenuItem::factory()->create(['menu' => MenuLocation::QuickLinks, 'label' => 'Higher Education Institutions', 'url' => '/heis']);

    $this->get(route('search', ['q' => 'contact']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('results.links', 1)
            ->where('results.links.0.url', '/contact'));

    $this->get(route('search', ['q' => 'institutions']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('results.links', 1)
            ->where('results.links.0.description', 'Directory of recognized institutions.'));
});

test('menu links to pages already in the page results are not repeated', function () {
    Page::factory()->create(['title' => 'Citizen\'s Charter', 'slug' => 'citizens-charter']);
    MenuItem::factory()->create(['label' => 'Citizen\'s Charter', 'url' => '/pages/citizens-charter']);

    $this->get(route('search', ['q' => 'charter']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('results.pages', 1)
            ->has('results.links', 0));
});
