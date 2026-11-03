<?php

use App\Enums\PostType;
use App\Models\Post;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a listing shows only published posts of its type', function () {
    $published = Post::factory()->ofType(PostType::Career)->create(['title' => 'Education Supervisor II']);
    Post::factory()->ofType(PostType::Career)->draft()->create();
    Post::factory()->ofType(PostType::Career)->scheduled()->create();
    Post::factory()->ofType(PostType::Announcement)->create();

    $this->get(route('careers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/posts/index')
            ->where('type.value', 'career')
            ->has('posts.data', 1)
            ->where('posts.data.0.slug', $published->slug));
});

test('a listing can be searched', function () {
    Post::factory()->create(['title' => 'Scholarship application period opens']);
    Post::factory()->create(['title' => 'Office closure advisory']);

    $this->get(route('announcements.index', ['q' => 'scholarship']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Scholarship application period opens'));
});

test('a published post can be viewed by its slug', function () {
    $post = Post::factory()->create(['youtube_url' => 'https://youtu.be/dQw4w9WgXcQ']);

    $this->get(route('posts.show', $post))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/posts/show')
            ->where('post.title', $post->title)
            ->where('post.youtube_id', 'dQw4w9WgXcQ')
            ->where('isPreview', false));
});

test('draft and scheduled posts are not found for guests', function (string $state) {
    $post = Post::factory()->{$state}()->create();

    $this->get(route('posts.show', $post))->assertNotFound();
})->with(['draft', 'scheduled']);

test('staff can preview unpublished posts', function () {
    $post = Post::factory()->draft()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('posts.show', $post))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('isPreview', true));
});

test('slugs stay unique when titles repeat', function () {
    $first = Post::factory()->create(['title' => 'Regional Memorandum Released']);
    $second = Post::factory()->create(['title' => 'Regional Memorandum Released']);

    expect($first->slug)->toBe('regional-memorandum-released')
        ->and($second->slug)->toBe('regional-memorandum-released-2');
});
