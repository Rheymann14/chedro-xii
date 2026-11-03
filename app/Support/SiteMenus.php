<?php

namespace App\Support;

use App\Enums\MenuLocation;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Cached, tree-shaped menus for the public site.
 */
class SiteMenus
{
    public const CACHE_KEY = 'site.menus';

    /**
     * @return array<string, list<array{id: int, label: string, url: string, description: string|null, opens_in_new_tab: bool, children: list<array<string, mixed>>}>>
     */
    public static function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            $items = MenuItem::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'menu', 'parent_id', 'label', 'url', 'description', 'opens_in_new_tab']);

            $byParent = $items->groupBy(fn (MenuItem $item) => $item->parent_id ?? 0)->all();
            $topLevel = $byParent[0] ?? new Collection;
            $menus = [];

            foreach (MenuLocation::cases() as $menu) {
                $menus[$menu->value] = self::tree(
                    $topLevel->filter(fn (MenuItem $item) => $item->menu === $menu),
                    $byParent,
                );
            }

            return $menus;
        });
    }

    /**
     * @return list<array{id: int, label: string, url: string, description: string|null, opens_in_new_tab: bool, children: list<array<string, mixed>>}>
     */
    public static function for(MenuLocation $menu): array
    {
        return static::all()[$menu->value] ?? [];
    }

    public static function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @param  Collection<int, MenuItem>  $items
     * @param  array<int|string, Collection<int, MenuItem>>  $byParent
     * @return list<array{id: int, label: string, url: string, description: string|null, opens_in_new_tab: bool, children: list<array<string, mixed>>}>
     */
    private static function tree(Collection $items, array $byParent): array
    {
        return array_values(array_map(fn (MenuItem $item): array => [
            'id' => $item->id,
            'label' => $item->label,
            'url' => $item->url,
            'description' => $item->description,
            'opens_in_new_tab' => $item->opens_in_new_tab,
            'children' => self::tree($byParent[$item->id] ?? new Collection, $byParent),
        ], $items->all()));
    }
}
