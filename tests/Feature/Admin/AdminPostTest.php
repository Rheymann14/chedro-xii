<?php

use App\Enums\PostType;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('editors can create a post with images', function () {
    Storage::fake(config('filesystems.media_disk'));
    $editor = User::factory()->create();

    $this->actingAs($editor)
        ->post(route('admin.posts.store'), [
            'type' => PostType::Announcement->value,
            'title' => 'Call for scholarship applications',
            'body' => '<p>Applications are now open.</p>',
            'published_at' => '2026-11-01 08:00',
            'images' => [UploadedFile::fake()->image('poster.jpg', 1200, 800)],
        ])
        ->assertSessionHasNoErrors();

    $post = Post::query()->with('images')->sole();

    expect($post->author_id)->toBe($editor->id)
        ->and($post->slug)->toBe('call-for-scholarship-applications')
        ->and($post->excerpt)->toBe('Applications are now open.')
        ->and($post->images)->toHaveCount(1)
        ->and($post->images->first()->width)->toBe(1200);

    Storage::disk(config('filesystems.media_disk'))->assertExists($post->images->first()->path);
});

test('the body is sanitized before it is saved', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), [
            'type' => PostType::Announcement->value,
            'title' => 'Advisory',
            'body' => '<p onclick="steal()">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>',
        ])
        ->assertSessionHasNoErrors();

    $body = Post::query()->sole()->body;

    expect($body)->toContain('Hello')
        ->not->toContain('<script')
        ->not->toContain('onclick')
        ->not->toContain('javascript:');
});

test('non-image uploads are rejected', function () {
    Storage::fake(config('filesystems.media_disk'));

    $this->actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), [
            'type' => PostType::Announcement->value,
            'title' => 'Advisory',
            'images' => [UploadedFile::fake()->create('payload.html', 10, 'text/html')],
        ])
        ->assertSessionHasErrors('images.0');

    expect(Post::query()->count())->toBe(0);
});

test('position and deadline are cleared for non-career posts', function () {
    $post = Post::factory()->ofType(PostType::Career)->create([
        'position' => 'Education Supervisor II',
        'closing_at' => now()->addWeek(),
    ]);

    $this->actingAs(User::factory()->create())
        ->put(route('admin.posts.update', $post), [
            'type' => PostType::Announcement->value,
            'title' => $post->title,
            'position' => 'Education Supervisor II',
        ])
        ->assertSessionHasNoErrors();

    expect($post->fresh())
        ->position->toBeNull()
        ->closing_at->toBeNull();
});

test('removed images are deleted along with their files', function () {
    Storage::fake(config('filesystems.media_disk'));
    $post = Post::factory()->create();
    $image = $post->images()->create(['path' => 'posts/images/old.jpg', 'sort_order' => 0]);
    Storage::disk(config('filesystems.media_disk'))->put('posts/images/old.jpg', 'image');

    $this->actingAs(User::factory()->create())
        ->put(route('admin.posts.update', $post), [
            'type' => $post->type->value,
            'title' => $post->title,
            'removed_images' => [$image->id],
        ])
        ->assertSessionHasNoErrors();

    expect($post->images()->count())->toBe(0);
    Storage::disk(config('filesystems.media_disk'))->assertMissing('posts/images/old.jpg');
});

test('deleting a post deletes its media files', function () {
    Storage::fake(config('filesystems.media_disk'));
    $post = Post::factory()->create();
    $post->images()->create(['path' => 'posts/images/cover.jpg', 'sort_order' => 0]);
    Storage::disk(config('filesystems.media_disk'))->put('posts/images/cover.jpg', 'image');

    $this->actingAs(User::factory()->create())
        ->delete(route('admin.posts.destroy', $post))
        ->assertRedirect(route('admin.posts.index'));

    $this->assertModelMissing($post);
    Storage::disk(config('filesystems.media_disk'))->assertMissing('posts/images/cover.jpg');
});
