<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MenuLocation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MenuItemRequest;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MenuItemController extends Controller
{
    public function index(): Response
    {
        $items = MenuItem::query()
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('admin/menus/index', [
            'menus' => array_map(fn (MenuLocation $menu): array => [
                'value' => $menu->value,
                'label' => $menu->label(),
                'items' => array_map(fn (MenuItem $item): array => [
                    ...$this->present($item),
                    'children' => array_map(fn (MenuItem $child): array => $this->present($child), $item->children->all()),
                ], $items->where('menu', $menu)->values()->all()),
            ], MenuLocation::cases()),
        ]);
    }

    public function store(MenuItemRequest $request): RedirectResponse
    {
        $data = $request->validated();

        MenuItem::query()->create([
            ...$data,
            'sort_order' => (int) MenuItem::query()
                ->where('menu', $data['menu'])
                ->where('parent_id', $data['parent_id'] ?? null)
                ->max('sort_order') + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Menu link added.']);

        return back();
    }

    public function update(MenuItemRequest $request, MenuItem $menuItem): RedirectResponse
    {
        $menuItem->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Menu link updated.']);

        return back();
    }

    /**
     * Move an item to a new zero-based position among its siblings, optionally
     * under a different top-level parent (child links only).
     */
    public function move(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $data = $request->validate([
            'position' => ['required', 'integer', 'min:0'],
            'parent_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::prohibitedIf($menuItem->parent_id === null),
                Rule::exists('menu_items', 'id')->whereNull('parent_id')->where('menu', $menuItem->menu->value),
                Rule::notIn([$menuItem->id]),
            ],
        ], [
            'parent_id.prohibited' => 'Top-level links cannot be moved under another link.',
            'parent_id.exists' => 'The parent must be a top-level item in the same menu.',
        ]);

        $position = (int) $data['position'];
        $parentId = array_key_exists('parent_id', $data) ? $data['parent_id'] : $menuItem->parent_id;

        DB::transaction(function () use ($menuItem, $position, $parentId): void {
            $menuItem->parent_id = $parentId;

            $siblings = MenuItem::query()
                ->where('menu', $menuItem->menu)
                ->where('parent_id', $parentId)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->reject(fn (MenuItem $item): bool => $item->is($menuItem))
                ->values()
                ->all();

            array_splice($siblings, min($position, count($siblings)), 0, [$menuItem]);

            foreach ($siblings as $index => $item) {
                $item->sort_order = $index;

                if ($item->isDirty()) {
                    $item->save();
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Menu order saved.']);

        return back();
    }

    public function destroy(MenuItem $menuItem): RedirectResponse
    {
        $menuItem->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Menu link deleted.']);

        return back();
    }

    /**
     * @return array{id: int, menu: string, parent_id: int|null, label: string, url: string, description: string|null, opens_in_new_tab: bool}
     */
    private function present(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'menu' => $item->menu->value,
            'parent_id' => $item->parent_id,
            'label' => $item->label,
            'url' => $item->url,
            'description' => $item->description,
            'opens_in_new_tab' => $item->opens_in_new_tab,
        ];
    }
}
