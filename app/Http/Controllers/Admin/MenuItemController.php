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
     * Move an item one position up or down among its siblings.
     */
    public function move(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]])['direction'];

        DB::transaction(function () use ($menuItem, $direction): void {
            $siblings = MenuItem::query()
                ->where('menu', $menuItem->menu)
                ->where('parent_id', $menuItem->parent_id)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->values();

            $index = $siblings->search(fn (MenuItem $item) => $item->is($menuItem));
            $swapWith = $direction === 'up' ? $index - 1 : $index + 1;

            if ($index === false || ! $siblings->has($swapWith)) {
                return;
            }

            $ordered = $siblings->all();
            [$ordered[$index], $ordered[$swapWith]] = [$ordered[$swapWith], $ordered[$index]];

            foreach ($ordered as $position => $item) {
                if ($item->sort_order !== $position) {
                    $item->update(['sort_order' => $position]);
                }
            }
        });

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
