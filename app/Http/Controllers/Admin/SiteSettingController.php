<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteSettingsRequest;
use App\Support\SiteSettings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/settings', [
            'settings' => SiteSettings::all(),
        ]);
    }

    public function update(SiteSettingsRequest $request): RedirectResponse
    {
        SiteSettings::update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Office information saved.']);

        return back();
    }
}
