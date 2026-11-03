<?php

namespace App\Models;

use App\Enums\PostType;
use App\Support\Media;
use App\Support\SearchTerm;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property PostType $type
 * @property string $title
 * @property string $slug
 * @property string|null $excerpt
 * @property string|null $body
 * @property string|null $position
 * @property Carbon|null $published_at
 * @property Carbon|null $closing_at
 * @property string|null $video_path
 * @property string|null $youtube_url
 * @property int|null $author_id
 * @property-read string|null $youtube_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['type', 'title', 'excerpt', 'body', 'position', 'published_at', 'closing_at', 'youtube_url'])]
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (Post $post): void {
            $post->slug ??= static::uniqueSlug($post->title);
        });

        static::deleting(function (Post $post): void {
            $post->images()->get()->each->delete();
            Media::delete($post->video_path);
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => PostType::class,
            'published_at' => 'datetime',
            'closing_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<PostImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(PostImage::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * The first image, used as the card thumbnail.
     *
     * @return HasOne<PostImage, $this>
     */
    public function cover(): HasOne
    {
        return $this->hasOne(PostImage::class)->ofMany(['sort_order' => 'min', 'id' => 'min']);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Posts visible to the public: published on or before now.
     *
     * @param  Builder<Post>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /**
     * @param  Builder<Post>  $query
     */
    #[Scope]
    protected function search(Builder $query, ?string $term): void
    {
        $term = trim((string) $term);

        if ($term === '') {
            return;
        }

        $query->where(function (Builder $query) use ($term): void {
            $like = SearchTerm::contains($term);

            $query->where('title', 'like', $like)
                ->orWhere('excerpt', 'like', $like)
                ->orWhere('position', 'like', $like);
        });
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }

    /**
     * The YouTube video ID parsed from the stored YouTube URL.
     *
     * @return Attribute<string|null, never>
     */
    protected function youtubeId(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->parseYoutubeId());
    }

    private function parseYoutubeId(): ?string
    {
        if ($this->youtube_url === null) {
            return null;
        }

        $pattern = '~(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/|live/)|youtu\.be/)([A-Za-z0-9_-]{11})~';

        return preg_match($pattern, $this->youtube_url, $matches) === 1 ? $matches[1] : null;
    }

    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::limit(Str::slug($title), 80, '') ?: 'post';
        $slug = $base;
        $suffix = 2;

        while (static::query()->where('slug', $slug)->when($ignoreId, fn (Builder $query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
