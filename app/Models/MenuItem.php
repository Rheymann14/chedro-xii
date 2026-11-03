<?php

namespace App\Models;

use App\Enums\MenuLocation;
use App\Support\SiteMenus;
use Database\Factories\MenuItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property MenuLocation $menu
 * @property int|null $parent_id
 * @property string $label
 * @property string $url
 * @property string|null $description
 * @property bool $opens_in_new_tab
 * @property int $sort_order
 */
#[Fillable(['menu', 'parent_id', 'label', 'url', 'description', 'opens_in_new_tab', 'sort_order'])]
class MenuItem extends Model
{
    /** @use HasFactory<MenuItemFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::saved(fn () => SiteMenus::flush());
        static::deleted(fn () => SiteMenus::flush());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'menu' => MenuLocation::class,
            'opens_in_new_tab' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<MenuItem, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * @return HasMany<MenuItem, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @param  Builder<MenuItem>  $query
     */
    #[Scope]
    protected function inMenu(Builder $query, MenuLocation $menu): void
    {
        $query->where('menu', $menu)->orderBy('sort_order')->orderBy('id');
    }
}
