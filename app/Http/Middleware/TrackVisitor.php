<?php

namespace App\Http\Middleware;

use App\Models\SiteCounter;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Counts each public browsing session once for the footer visitor count.
 * Staff, crawlers, and non-page requests are not counted.
 */
class TrackVisitor
{
    private const SESSION_KEY = 'visitor_counted';

    private const BOT_PATTERN = '/bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python|headless/i';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldCount($request)) {
            $request->session()->put(self::SESSION_KEY, true);
            SiteCounter::bump(SiteCounter::VISITORS);
        }

        return $next($request);
    }

    private function shouldCount(Request $request): bool
    {
        return $request->isMethod('GET')
            && ! $request->expectsJson()
            && $request->user() === null
            && ! $request->is('admin', 'admin/*', 'login', 'settings/*')
            && ! $request->session()->has(self::SESSION_KEY)
            && preg_match(self::BOT_PATTERN, (string) $request->userAgent()) !== 1;
    }
}
