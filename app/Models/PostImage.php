<?php

namespace App\Models;

use App\Support\Media;
use Database\Factories\PostImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $post_id
 * @property string $path
 * @property string|null $thumbnail_path
 * @property string|null $alt
 * @property int|null $width
 * @property int|null $height
 * @property int $sort_order
 */
#[Fillable(['path', 'thumbnail_path', 'alt', 'width', 'height', 'sort_order'])]
class PostImage extends Model
{
    /** @use HasFactory<PostImageFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::deleted(function (PostImage $image): void {
            Media::delete($image->path);
            Media::delete($image->thumbnail_path);
        });
    }

    /**
     * @return BelongsTo<Post, $this>
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
