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

test('large images are resized, converted to WebP, and given a thumbnail', function () {
    Storage::fake(config('filesystems.media_disk'));

    $this->actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), [
            'type' => PostType::Announcement->value,
            'title' => 'Regional assembly',
            'images' => [UploadedFile::fake()->image('assembly.jpg', 4000, 3000)],
        ])
        ->assertSessionHasNoErrors();

    $image = Post::query()->sole()->images()->sole();
    $disk = Storage::disk(config('filesystems.media_disk'));

    expect($image)
        ->path->toEndWith('.webp')
        ->width->toBe(2560)
        ->height->toBe(1920);
    expect(getimagesizefromstring($disk->get($image->path)))
        ->toMatchArray([0 => 2560, 1 => 1920, 'mime' => 'image/webp']);
    expect(getimagesizefromstring($disk->get($image->thumbnail_path)))
        ->toMatchArray([0 => 800, 1 => 600, 'mime' => 'image/webp']);
});

test('embedded photo metadata such as GPS location is removed from images', function () {
    Storage::fake(config('filesystems.media_disk'));
    $jpeg = UploadedFile::fake()->image('photo.jpg', 1600, 1200)->getContent();
    $exif = "Exif\0\0II*\0\x08\0\0\0\0\0GPSLatitude 6.1164 N";
    $jpegWithExif = substr($jpeg, 0, 2)."\xFF\xE1".pack('n', strlen($exif) + 2).$exif.substr($jpeg, 2);

    $this->actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), [
            'type' => PostType::Announcement->value,
            'title' => 'Field visit',
            'images' => [UploadedFile::fake()->createWithContent('photo.jpg', $jpegWithExif)],
        ])
        ->assertSessionHasNoErrors();

    $image = Post::query()->sole()->images()->sole();

    expect(Storage::disk(config('filesystems.media_disk'))->get($image->path))
        ->not->toContain('GPSLatitude')
        ->not->toContain('Exif');
});

test('photos taken sideways are rotated upright using their EXIF orientation', function () {
    Storage::fake(config('filesystems.media_disk'));
    $jpeg = UploadedFile::fake()->image('photo.jpg', 1600, 1200)->getContent();
    $rotateClockwise = pack('v', 1).pack('vvVv', 0x0112, 3, 1, 6)."\0\0".pack('V', 0);
    $exif = "Exif\0\0II*\0".pack('V', 8).$rotateClockwise;
    $jpegWithExif = substr($jpeg, 0, 2)."\xFF\xE1".pack('n', strlen($exif) + 2).$exif.substr($jpeg, 2);

    $this->actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), [
            'type' => PostType::Announcement->value,
            'title' => 'Campus tour',
            'images' => [UploadedFile::fake()->createWithContent('photo.jpg', $jpegWithExif)],
        ])
        ->assertSessionHasNoErrors();

    expect(Post::query()->sole()->images()->sole())
        ->width->toBe(1200)
        ->height->toBe(1600);
})->skip(! function_exists('exif_read_data'), 'Requires the exif extension.');

test('videos larger than 50 MB are rejected', function () {
    Storage::fake(config('filesystems.media_disk'));

    $this->actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), [
            'type' => PostType::Announcement->value,
            'title' => 'Event highlights',
            'video' => UploadedFile::fake()->create('highlights.mp4', 51 * 1024, 'video/mp4'),
        ])
        ->assertSessionHasErrors(['video' => 'The video must be 50 MB or smaller. Upload longer videos to YouTube and paste the link instead.']);

    expect(Post::query()->count())->toBe(0);
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
