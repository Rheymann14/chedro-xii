<?php

namespace App\Http\Controllers;

use App\Http\Resources\IssuanceResource;
use App\Http\Resources\PostResource;
use App\Models\Issuance;
use App\Models\Page;
use App\Models\Post;
use App\Support\SearchTerm;
use App\Support\SiteMenus;
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

            $pages = Page::query()
                ->published()
                ->where(fn (Builder $query) => $query->where('title', 'like', $like)->orWhere('meta_description', 'like', $like))
                ->orderBy('title')
                ->limit(6)
                ->get(['title', 'slug', 'meta_description']);

            $results = [
                'links' => $this->matchingMenuLinks($term, $pages->map(fn (Page $page) => '/pages/'.$page->slug)->all()),
                'pages' => $pages,
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
            ];
        }

        return Inertia::render('public/search', [
            'q' => $term,
            'results' => $results,
        ]);
    }

    /**
     * Site menu links (built-in sections such as Contact Us, HEIs, and the
     * online services) whose label or description contains the term, one per
     * URL, skipping pages that are already in the page results.
     *
     * @param  list<string>  $excludedUrls
     * @return list<array{label: string, url: string, description: string|null, opens_in_new_tab: bool}>
     */
    private function matchingMenuLinks(string $term, array $excludedUrls): array
    {
        $links = [];
        $pending = array_merge(...array_values(SiteMenus::all()));

        while ($pending !== []) {
            $item = array_shift($pending);
            array_unshift($pending, ...$item['children']);

            $matches = mb_stripos($item['label'], $term) !== false
                || mb_stripos((string) $item['description'], $term) !== false;

            if (! $matches || in_array($item['url'], $excludedUrls, true)) {
                continue;
            }

            // Header items come first and usually carry a description, so the first copy of a URL wins.
            $links[$item['url']] ??= [
                'label' => $item['label'],
                'url' => $item['url'],
                'description' => $item['description'],
                'opens_in_new_tab' => $item['opens_in_new_tab'],
            ];
        }

        return array_slice(array_values($links), 0, 8);
    }
}
