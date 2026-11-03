<?php

namespace App\Models;

use App\Support\Media;
use Database\Factories\BannerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Home page hero carousel slides.
 *
 * @property int $id
 * @property string $title
 * @property string $image_path
 * @property string|null $alt
 * @property string|null $link_url
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 */
#[Fillable(['title', 'alt', 'link_url', 'sort_order', 'is_active', 'starts_at', 'ends_at'])]
class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::deleted(fn (Banner $banner) => Media::delete($banner->image_path));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /**
     * Active banners within their optional display window.
     *
     * @param  Builder<Banner>  $query
     */
    #[Scope]
    protected function showing(Builder $query): void
    {
        $query->where('is_active', true)
            ->where(fn (Builder $query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn (Builder $query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', now()));
    }
}
