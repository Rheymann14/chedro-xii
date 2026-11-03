<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class CalendarController extends Controller
{
    /**
     * Published posts in a month, grouped by day, for the home page calendar.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $start = Date::createFromFormat('Y-m-d', $validated['month'].'-01')->startOfDay();

        $days = Post::query()
            ->published()
            ->whereBetween('published_at', [$start, $start->endOfMonth()])
            ->oldest('published_at')
            ->get(['id', 'type', 'title', 'slug', 'published_at'])
            ->groupBy(fn (Post $post): string => $post->published_at?->toDateString() ?? '')
            ->map(fn ($posts) => $posts->map(fn (Post $post): array => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'type_label' => $post->type->label(),
            ])->values());

        return response()->json([
            'month' => $validated['month'],
            'days' => $days,
        ]);
    }
}
