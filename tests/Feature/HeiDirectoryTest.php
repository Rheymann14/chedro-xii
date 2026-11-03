<?php

use App\Services\PortalService;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config([
        'services.portal.url' => 'https://portal.test/api',
        'services.portal.key' => 'secret-key',
    ]);

    Http::preventStrayRequests();
});

test('institutions are loaded from the portal, normalized, and sorted', function () {
    Http::fake([
        'portal.test/api/fetch-all-hei' => Http::response([
            ['instCode' => '12001', 'instName' => 'Notre Dame of Marbel University', 'instOwnership' => 'PSS', 'province' => 'South Cotabato', 'municipalityCity' => 'Koronadal City'],
            ['instCode' => '12002', 'instName' => 'Mindanao State University - General Santos', 'instOwnership' => 'CSCU-MAIN', 'province' => 'South Cotabato', 'municipalityCity' => 'General Santos City'],
            ['instCode' => '', 'instName' => ''],
        ]),
    ]);

    $this->get(route('heis.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/heis/index')
            ->where('available', true)
            ->where('total', 2)
            ->where('institutions.data.0.name', 'Mindanao State University - General Santos')
            ->where('institutions.data.0.type', 'State University')
            ->where('institutions.data.1.type', 'Private Sectarian'));

    Http::assertSent(fn ($request) => $request->hasHeader('PORTAL-API', 'secret-key'));
});

test('institutions can be filtered by search term and province', function () {
    Http::fake([
        'portal.test/api/fetch-all-hei' => Http::response([
            ['instName' => 'Sultan Kudarat State University', 'province' => 'Sultan Kudarat', 'municipalityCity' => 'Tacurong City'],
            ['instName' => 'Notre Dame of Kidapawan College', 'province' => 'Cotabato', 'municipalityCity' => 'Kidapawan City'],
        ]),
    ]);

    $this->get(route('heis.index', ['q' => 'tacurong', 'province' => 'Sultan Kudarat']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('institutions.data', 1)
            ->where('institutions.data.0.name', 'Sultan Kudarat State University'));
});

test('the directory reports unavailability when the portal fails', function () {
    Http::fake(['portal.test/api/fetch-all-hei' => Http::response('Server error', 500)]);

    $this->get(route('heis.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('available', false)
            ->has('institutions.data', 0));
});

test('successful portal responses are cached', function () {
    Http::fake(['portal.test/api/fetch-all-hei' => Http::response([['instName' => 'Cached College']])]);

    $portal = app(PortalService::class);
    $portal->institutions();
    $portal->institutions();

    Http::assertSentCount(1);
});

test('the directory can be exported to Excel', function () {
    Http::fake(['portal.test/api/fetch-all-hei' => Http::response([['instName' => 'Cotabato State University']])]);

    $this->get(route('heis.export', 'xlsx'))
        ->assertOk()
        ->assertDownload('region-xii-heis-'.now()->format('Y-m-d').'.xlsx');
});

test('exports are unavailable while the portal is down', function () {
    Http::fake(['portal.test/api/fetch-all-hei' => Http::response('Server error', 500)]);

    $this->get(route('heis.export', 'pdf'))->assertServiceUnavailable();
});
