<?php

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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
