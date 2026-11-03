<?php

namespace App\Http\Controllers;

use App\Http\Resources\BannerResource;
use App\Http\Resources\IssuanceResource;
use App\Http\Resources\PostResource;
use App\Models\Banner;
use App\Models\Issuance;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('public/home', [
            'banners' => BannerResource::collection(
                Banner::query()->showing()->orderBy('sort_order')->latest('id')->limit(8)->get(),
            ),
            'timeline' => PostResource::collection(
                Post::query()
                    ->published()
                    ->with('cover')
                    ->latest('published_at')
                    ->limit(8)
                    ->get(['id', 'type', 'title', 'slug', 'excerpt', 'position', 'published_at', 'closing_at']),
            ),
            'issuances' => Inertia::defer(fn () => IssuanceResource::collection(
                Issuance::query()
                    ->visibleTo($request->user())
                    ->with('type')
                    ->latest('issued_on')
                    ->latest('id')
                    ->limit(5)
                    ->get(),
            )),
        ]);
    }
}
