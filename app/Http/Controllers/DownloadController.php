<?php

namespace App\Http\Controllers;

use App\Http\Resources\DownloadResource;
use App\Models\DownloadCategory;
use Inertia\Inertia;
use Inertia\Response;

class DownloadController extends Controller
{
    public function index(): Response
    {
        $categories = DownloadCategory::query()
            ->whereHas('downloads')
            ->with('downloads')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('public/downloads/index', [
            'categories' => $categories->map(fn (DownloadCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'downloads' => DownloadResource::collection($category->downloads),
            ]),
        ]);
    }
}
