<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Models\Banner;
use App\Support\Media;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/banners/index', [
            'banners' => Banner::query()
                ->orderBy('sort_order')
                ->latest('id')
                ->get()
                ->map(fn (Banner $banner): array => [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'image_url' => Media::url($banner->image_path),
                    'link_url' => $banner->link_url,
                    'is_active' => $banner->is_active,
                    'starts_at' => $banner->starts_at?->toIso8601String(),
                    'ends_at' => $banner->ends_at?->toIso8601String(),
                    'sort_order' => $banner->sort_order,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/banners/form', ['banner' => null]);
    }

    public function store(BannerRequest $request): RedirectResponse
    {
        $banner = new Banner($request->safe()->except('image'));
        $banner->sort_order ??= 0;
        $banner->image_path = Media::store($request->file('image'), 'banners');
        $banner->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Banner added.']);

        return to_route('admin.banners.index');
    }

    public function edit(Banner $banner): Response
    {
        return Inertia::render('admin/banners/form', [
            'banner' => [
                'id' => $banner->id,
                'title' => $banner->title,
                'alt' => $banner->alt,
                'link_url' => $banner->link_url,
                'sort_order' => $banner->sort_order,
                'is_active' => $banner->is_active,
                'starts_at' => $banner->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $banner->ends_at?->format('Y-m-d\TH:i'),
                'image_url' => Media::url($banner->image_path),
            ],
        ]);
    }

    public function update(BannerRequest $request, Banner $banner): RedirectResponse
    {
        $banner->fill($request->safe()->except('image'));
        $banner->sort_order ??= 0;
        $oldImage = null;

        if ($request->hasFile('image')) {
            $oldImage = $banner->image_path;
            $banner->image_path = Media::store($request->file('image'), 'banners');
        }

        $banner->save();
        Media::delete($oldImage);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Banner updated.']);

        return to_route('admin.banners.index');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $banner->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Banner deleted.']);

        return back();
    }
}
