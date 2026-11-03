<?php

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Central access to the disks that hold uploaded content, so the app can move
 * from local storage to an S3-compatible bucket with configuration only.
 */
class Media
{
    public static function disk(): FilesystemAdapter
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.media_disk'));

        return $disk;
    }

    public static function privateDisk(): FilesystemAdapter
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.private_media_disk'));

        return $disk;
    }

    /**
     * Store an upload on the public media disk under a hashed file name.
     */
    public static function store(UploadedFile $file, string $directory): string
    {
        return (string) $file->store($directory, ['disk' => config('filesystems.media_disk'), 'visibility' => 'public']);
    }

    /**
     * Optimize an image upload and store one copy per variant on the public
     * media disk, all under the same hashed file name. An image that cannot be
     * decoded is stored once as uploaded and shared by every variant.
     *
     * @param  array<string, int>  $variants  directory => longest edge in pixels
     * @return array<string, array{path: string, width: int|null, height: int|null}>
     */
    public static function storeImage(File|UploadedFile $file, array $variants): array
    {
        $optimized = ImageOptimizer::optimize($file->getRealPath(), array_values($variants));

        if ($optimized === null) {
            [$width, $height] = @getimagesize($file->getRealPath()) ?: [null, null];
            $path = (string) static::disk()->putFile((string) array_key_first($variants), $file, 'public');

            return array_map(fn (): array => ['path' => $path, 'width' => $width, 'height' => $height], $variants);
        }

        $name = Str::random(40).'.webp';
        $stored = [];

        foreach (array_keys($variants) as $index => $directory) {
            $path = $directory.'/'.$name;
            static::disk()->put($path, $optimized[$index]['contents'], 'public');
            $stored[$directory] = ['path' => $path, 'width' => $optimized[$index]['width'], 'height' => $optimized[$index]['height']];
        }

        return $stored;
    }

    /**
     * Store an upload on the private media disk under a hashed file name.
     */
    public static function storePrivately(UploadedFile $file, string $directory): string
    {
        return (string) $file->store($directory, ['disk' => config('filesystems.private_media_disk')]);
    }

    public static function url(?string $path): ?string
    {
        return $path === null ? null : static::disk()->url($path);
    }

    public static function delete(?string $path): void
    {
        if ($path !== null) {
            static::disk()->delete($path);
        }
    }

    public static function deletePrivately(?string $path): void
    {
        if ($path !== null) {
            static::privateDisk()->delete($path);
        }
    }
}
