<?php

namespace App\Models;

use Database\Factories\DownloadCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $sort_order
 */
#[Fillable(['name', 'sort_order'])]
class DownloadCategory extends Model
{
    /** @use HasFactory<DownloadCategoryFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::saving(function (DownloadCategory $category): void {
            $category->slug = Str::slug($category->name);
        });
    }

    /**
     * @return HasMany<Download, $this>
     */
    public function downloads(): HasMany
    {
        return $this->hasMany(Download::class)->orderBy('sort_order')->orderBy('title');
    }
}
