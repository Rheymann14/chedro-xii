<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TaxonomyRequest;
use App\Models\DownloadCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DownloadCategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/taxonomies', [
            'title' => 'Download categories',
            'description' => 'Groups shown on the public Downloadable Forms page.',
            'resource' => 'download-categories',
            'items' => DownloadCategory::query()
                ->withCount('downloads as items_count')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'sort_order']),
        ]);
    }

    public function store(TaxonomyRequest $request): RedirectResponse
    {
        DownloadCategory::query()->create($request->safe()->only(['name', 'sort_order']));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category added.']);

        return back();
    }

    public function update(TaxonomyRequest $request, DownloadCategory $downloadCategory): RedirectResponse
    {
        $downloadCategory->update($request->safe()->only(['name', 'sort_order']));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated.']);

        return back();
    }

    public function destroy(DownloadCategory $downloadCategory): RedirectResponse
    {
        if ($downloadCategory->downloads()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This category still has files. Move or delete them first.']);

            return back();
        }

        $downloadCategory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted.']);

        return back();
    }
}
