<?php

namespace App\Http\Middleware;

use App\Enums\MenuLocation;
use App\Models\SiteCounter;
use App\Support\SiteMenus;
use App\Support\SiteSettings;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => fn () => $request->user()?->only('id', 'name', 'email', 'role'),
            ],
            'site' => fn (): array => [
                'settings' => SiteSettings::all(),
                'menus' => [
                    'header' => SiteMenus::for(MenuLocation::Header),
                    'quick_links' => SiteMenus::for(MenuLocation::QuickLinks),
                    'footer' => SiteMenus::for(MenuLocation::Footer),
                ],
                'visitors' => $this->visitors(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * @return array{count: int, since: string|null}
     */
    private function visitors(): array
    {
        $counter = SiteCounter::query()->where('key', SiteCounter::VISITORS)->first(['value', 'created_at']);

        return [
            'count' => $counter->value ?? 0,
            'since' => $counter?->created_at?->toDateString(),
        ];
    }
}
