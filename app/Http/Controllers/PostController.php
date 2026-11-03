<?php

namespace App\Http\Controllers;

use App\Enums\PostType;
use App\Http\Resources\PostDetailResource;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Paginated listing for one post type (announcements, careers, awards).
     */
    public function index(Request $request, PostType $type): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $posts = Post::query()
            ->published()
            ->where('type', $type)
            ->search($filters['q'] ?? null)
            ->when($filters['year'] ?? null, fn ($query, int $year) => $query->whereBetween('published_at', [
                now()->setDate($year, 1, 1)->startOfDay(),
                now()->setDate($year, 12, 31)->endOfDay(),
            ]))
            ->with('cover')
            ->latest('published_at')
            ->paginate(9, ['id', 'type', 'title', 'slug', 'excerpt', 'position', 'published_at', 'closing_at'])
            ->withQueryString();

        return Inertia::render('public/posts/index', [
            'type' => [
                'value' => $type->value,
                'label' => $type->pluralLabel(),
                'description' => $type->description(),
            ],
            'posts' => PostResource::collection($posts),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'year' => isset($filters['year']) ? (string) $filters['year'] : '',
            ],
            'years' => $this->publishedYears($type),
        ]);
    }

    public function show(Request $request, Post $post): Response
    {
        abort_unless($post->isPublished() || Gate::allows('manage-content'), 404);

        $post->load('images');

        $related = Post::query()
            ->published()
            ->where('type', $post->type)
            ->whereKeyNot($post->getKey())
            ->with('cover')
            ->latest('published_at')
            ->limit(3)
            ->get(['id', 'type', 'title', 'slug', 'excerpt', 'position', 'published_at', 'closing_at']);

        return Inertia::render('public/posts/show', [
            'post' => PostDetailResource::make($post),
            'related' => PostResource::collection($related),
            'listing' => [
                'label' => $post->type->pluralLabel(),
                'url' => route($post->type->routeName()),
            ],
            'isPreview' => ! $post->isPublished(),
        ]);
    }

    /**
     * Years that have published posts, newest first, for the year filter.
     *
     * @return list<int>
     */
    private function publishedYears(PostType $type): array
    {
        $oldest = Post::query()->published()->where('type', $type)->min('published_at');

        if ($oldest === null) {
            return [];
        }

        return range(now()->year, Date::parse($oldest)->year);
    }
}
