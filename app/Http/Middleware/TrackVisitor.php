<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Remembers which public pages were served to a browsing session, so the
 * footer may count one visit per page and session. Prefetches are included
 * because a prefetched page is later shown from the browser cache. Staff,
 * crawlers, and non-page responses are not remembered.
 */
class TrackVisitor
{
    /**
     * Session key holding served page paths, each mapped to whether its visit
     * was already counted.
     */
    public const SESSION_KEY = 'page_views';

    private const BOT_PATTERN = '/bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python|headless/i';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->isCountablePage($request, $response)) {
            $servedPages = $request->session()->get(self::SESSION_KEY, []);
            $servedPages[self::pathOf($request)] ??= false;

            $request->session()->put(self::SESSION_KEY, $servedPages);
        }

        return $response;
    }

    /**
     * The request path with a leading slash, such as "/" or "/announcements".
     */
    public static function pathOf(Request $request): string
    {
        return '/'.ltrim($request->path(), '/');
    }

    private function isCountablePage(Request $request, Response $response): bool
    {
        return $request->isMethod('GET')
            && $response->isSuccessful()
            && ($response->headers->has('X-Inertia') || str_contains((string) $response->headers->get('Content-Type'), 'text/html'))
            && $request->user() === null
            && ! $request->is('admin', 'admin/*', 'login', 'settings/*')
            && preg_match(self::BOT_PATTERN, (string) $request->userAgent()) !== 1;
    }
}
