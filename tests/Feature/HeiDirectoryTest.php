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
            ->where('institutions.data.0.type', 'SUC')
            ->where('institutions.data.0.ownership', 'State University')
            ->where('institutions.data.1.type', 'Private')
            ->where('institutions.data.1.ownership', 'Private Sectarian'));

    Http::assertSent(fn ($request) => $request->hasHeader('PORTAL-API', 'secret-key'));
});

test('institutions are grouped into SUC, LUC, and Private with counts per type', function () {
    Http::fake([
        'portal.test/api/fetch-all-hei' => Http::response([
            ['instName' => 'Sultan Kudarat State University', 'instOwnership' => 'CSCU-MAIN', 'ownershipHei_type' => 'SUC'],
            ['instName' => 'Sultan Kudarat State University - Isulan', 'instOwnership' => 'CSCU-SAT', 'ownershipHei_type' => 'SUC-SAT'],
            ['instName' => 'Koronadal City Polytechnic College', 'instOwnership' => 'LGCU', 'ownershipHei_type' => 'LUC'],
            ['instName' => 'Notre Dame of Marbel University', 'instOwnership' => 'PSS', 'ownershipHei_type' => 'PRIVATE'],
            ['instName' => 'Ramon Magsaysay Memorial Colleges', 'instOwnership' => 'PNN'],
        ]),
    ]);

    $this->get(route('heis.index', ['type' => 'SUC']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('total', 5)
            ->where('types', ['SUC', 'LUC', 'Private'])
            ->where('counts', ['SUC' => 2, 'LUC' => 1, 'Private' => 2])
            ->has('institutions.data', 2)
            ->where('institutions.data.1.ownership', 'State University (Satellite)'));
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

test('institutions can be found by their UII', function () {
    Http::fake([
        'portal.test/api/fetch-all-hei' => Http::response([
            ['instCode' => '12001', 'instName' => 'Notre Dame of Marbel University'],
            ['instCode' => '11048', 'instName' => 'Mindanao State University - General Santos'],
        ]),
    ]);

    $this->get(route('heis.index', ['q' => '11048']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('institutions.data', 1)
            ->where('institutions.data.0.code', '11048'));
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

    $response = $this->get(route('heis.export', 'xlsx'))
        ->assertOk()
        ->assertDownload('region-xii-heis-'.now()->format('Y-m-d').'.xlsx');

    $path = tempnam(sys_get_temp_dir(), 'heis');
    file_put_contents($path, $response->streamedContent());

    $zip = new ZipArchive;
    $zip->open($path);
    $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');
    $styles = $zip->getFromName('xl/styles.xml');
    $zip->close();
    unlink($path);

    expect($sheet)
        ->toContain('Cotabato State University')
        ->toContain('<autoFilter ref="A1:G2"/>')
        ->toContain('<col min="2" max="2" width="27"')
        ->not->toContain('customHeight')
        ->and($styles)
        ->toContain('wrapText="1"')
        ->toContain('<left style="thin"');
});

test('exports are unavailable while the portal is down', function () {
    Http::fake(['portal.test/api/fetch-all-hei' => Http::response('Server error', 500)]);

    $this->get(route('heis.export', 'pdf'))->assertServiceUnavailable();
});

test('a custom CA bundle is used for portal requests when configured', function () {
    config(['services.portal.ca_bundle' => 'C:/certs/ca-bundle.crt']);

    $verify = null;
    Http::fake(function ($request, array $options) use (&$verify) {
        $verify = $options['verify'] ?? null;

        return Http::response([['instName' => 'Cotabato State University']]);
    });

    app(PortalService::class)->institutions();

    expect($verify)->toBe('C:/certs/ca-bundle.crt');
});
