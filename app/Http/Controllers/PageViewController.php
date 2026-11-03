<?php

namespace App\Http\Controllers;

use App\Http\Middleware\TrackVisitor;
use App\Models\SiteCounter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageViewController extends Controller
{
    /**
     * Count a visit to a public page once per session and return the page's
     * visitor count for the footer. Only pages served to this session count.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'path' => ['required', 'string', 'starts_with:/', 'max:200'],
        ]);

        $path = $validated['path'];
        $key = SiteCounter::pageVisitorsKey($path);
        $servedPages = $request->session()->get(TrackVisitor::SESSION_KEY, []);

        if (($servedPages[$path] ?? null) === false) {
            SiteCounter::bump($key);
            $servedPages[$path] = true;
            $request->session()->put(TrackVisitor::SESSION_KEY, $servedPages);
        }

        $counter = SiteCounter::query()->where('key', $key)->first(['value', 'created_at']);

        return response()->json([
            'count' => $counter->value ?? 0,
            'since' => $counter?->created_at?->toDateString(),
        ]);
    }
}
