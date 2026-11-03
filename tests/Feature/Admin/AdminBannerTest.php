<?php

use App\Models\Banner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('banner images are resized and converted to WebP', function () {
    Storage::fake(config('filesystems.media_disk'));

    $this->actingAs(User::factory()->create())
        ->post(route('admin.banners.store'), [
            'title' => 'Scholarship season',
            'is_active' => true,
            'image' => UploadedFile::fake()->image('banner.png', 5120, 2000),
        ])
        ->assertRedirect(route('admin.banners.index'));

    $banner = Banner::query()->sole();

    expect($banner->image_path)->toEndWith('.webp');
    expect(getimagesizefromstring(Storage::disk(config('filesystems.media_disk'))->get($banner->image_path)))
        ->toMatchArray([0 => 2560, 1 => 1000, 'mime' => 'image/webp']);
});
