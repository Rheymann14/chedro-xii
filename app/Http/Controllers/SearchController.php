<?php

namespace App\Http\Controllers;

use App\Http\Resources\IssuanceResource;
use App\Http\Resources\PostResource;
use App\Models\Issuance;
use App\Models\Page;
use App\Models\Post;
use App\Support\SearchTerm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $term = trim((string) ($validated['q'] ?? ''));
        $results = null;

        if (mb_strlen($term) >= 2) {
            $like = SearchTerm::contains($term);

            $results = [
                'posts' => PostResource::collection(
                    Post::query()
                        ->published()
                        ->search($term)
                        ->with('cover')
                        ->latest('published_at')
                        ->limit(12)
                        ->get(['id', 'type', 'title', 'slug', 'excerpt', 'position', 'published_at', 'closing_at']),
                ),
                'issuances' => IssuanceResource::collection(
                    Issuance::query()
                        ->visibleTo($request->user())
                        ->where(fn (Builder $query) => $query->where('title', 'like', $like)->orWhere('reference_no', 'like', $like))
                        ->with('type')
                        ->latest('issued_on')
                        ->limit(10)
                        ->get(),
                ),
                'pages' => Page::query()
                    ->published()
                    ->where(fn (Builder $query) => $query->where('title', 'like', $like)->orWhere('meta_description', 'like', $like))
                    ->orderBy('title')
                    ->limit(6)
                    ->get(['title', 'slug', 'meta_description']),
            ];
        }

        return Inertia::render('public/search', [
            'q' => $term,
            'results' => $results,
        ]);
    }
}
