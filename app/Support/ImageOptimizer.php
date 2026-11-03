<?php

namespace App\Support;

use GdImage;

/**
 * Re-encodes uploaded images as WebP scaled down to fit a longest edge. Because
 * the pixels are re-encoded, embedded metadata such as camera and GPS EXIF
 * data is dropped.
 */
class ImageOptimizer
{
    public const int Quality = 80;

    /**
     * Encode one copy of the image per longest edge, never enlarging it.
     *
     * Returns null when GD cannot decode the file (for example an animated WebP).
     *
     * @param  list<int>  $longestEdges
     * @return list<array{contents: string, width: int, height: int}>|null
     */
    public static function optimize(string $path, array $longestEdges): ?array
    {
        $source = @imagecreatefromstring((string) file_get_contents($path));

        if ($source === false) {
            return null;
        }

        $source = self::orient($source, $path);

        return array_map(fn (int $longestEdge): array => self::encode($source, $longestEdge), $longestEdges);
    }

    /**
     * @return array{contents: string, width: int, height: int}
     */
    private static function encode(GdImage $source, int $longestEdge): array
    {
        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $scale = min(1, $longestEdge / max($sourceWidth, $sourceHeight));
        $width = max(1, (int) round($sourceWidth * $scale));
        $height = max(1, (int) round($sourceHeight * $scale));

        $image = imagecreatetruecolor($width, $height);
        imagealphablending($image, false);
        imagesavealpha($image, true);
        imagecopyresampled($image, $source, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);

        ob_start();
        imagewebp($image, null, self::Quality);

        return ['contents' => (string) ob_get_clean(), 'width' => $width, 'height' => $height];
    }

    /**
     * Rotate a JPEG upright according to its EXIF orientation, since the tag is
     * lost on re-encoding. Requires the exif extension; without it the image is
     * left as decoded.
     */
    private static function orient(GdImage $image, string $path): GdImage
    {
        if (! function_exists('exif_read_data')) {
            return $image;
        }

        $orientation = (@exif_read_data($path) ?: [])['Orientation'] ?? 1;

        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };

        return $rotated === false ? $image : $rotated;
    }
}
