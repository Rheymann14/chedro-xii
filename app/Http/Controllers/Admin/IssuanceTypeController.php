<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TaxonomyRequest;
use App\Models\IssuanceType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IssuanceTypeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/taxonomies', [
            'title' => 'Issuance types',
            'description' => 'Categories used to organize regional memoranda and other issuances.',
            'resource' => 'issuance-types',
            'items' => IssuanceType::query()
                ->withCount('issuances as items_count')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'sort_order']),
        ]);
    }

    public function store(TaxonomyRequest $request): RedirectResponse
    {
        IssuanceType::query()->create($request->safe()->only(['name', 'sort_order']));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Issuance type added.']);

        return back();
    }

    public function update(TaxonomyRequest $request, IssuanceType $issuanceType): RedirectResponse
    {
        $issuanceType->update($request->safe()->only(['name', 'sort_order']));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Issuance type updated.']);

        return back();
    }

    public function destroy(IssuanceType $issuanceType): RedirectResponse
    {
        if ($issuanceType->issuances()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This type still has issuances. Move or delete them first.']);

            return back();
        }

        $issuanceType->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Issuance type deleted.']);

        return back();
    }
}
