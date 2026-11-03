<?php

namespace App\Http\Controllers;

use App\Enums\MenuLocation;
use App\Support\SiteMenus;
use Inertia\Inertia;
use Inertia\Response;

class HubController extends Controller
{
    /**
     * Landing page for a top-level navigation group (About, Online Services,
     * HEMIS, Resources), listing the group's links as cards.
     */
    public function __invoke(string $hub): Response
    {
        $item = collect(SiteMenus::for(MenuLocation::Header))
            ->firstWhere('url', '/'.$hub);

        abort_if($item === null, 404);

        return Inertia::render('public/hub', [
            'hub' => $item,
        ]);
    }
}
