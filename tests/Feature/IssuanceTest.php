<?php

use App\Models\Issuance;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests only see public issuances', function () {
    $public = Issuance::factory()->create();
    Issuance::factory()->internal()->create();

    $this->get(route('issuances.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/issuances/index')
            ->has('issuances.data', 1)
            ->where('issuances.data.0.id', $public->id));
});

test('staff also see internal issuances', function () {
    Issuance::factory()->create();
    Issuance::factory()->internal()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('issuances.index'))
        ->assertInertia(fn (Assert $page) => $page->has('issuances.data', 2));
});

test('issuances can be filtered by type and year', function () {
    $match = Issuance::factory()->create(['issued_on' => '2025-03-10']);
    Issuance::factory()->create(['issuance_type_id' => $match->issuance_type_id, 'issued_on' => '2024-03-10']);
    Issuance::factory()->create(['issued_on' => '2025-05-01']);

    $this->get(route('issuances.index', ['type' => $match->type->slug, 'year' => 2025]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('issuances.data', 1)
            ->where('issuances.data.0.id', $match->id));
});

test('public issuance files can be downloaded by anyone', function () {
    Storage::fake(config('filesystems.private_media_disk'));
    $issuance = Issuance::factory()->create(['file_path' => 'issuances/memo.pdf', 'file_name' => 'RM-12.pdf']);
    Storage::disk(config('filesystems.private_media_disk'))->put('issuances/memo.pdf', '%PDF-1.4');

    $this->get(route('issuances.file', $issuance))
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff');
});

test('internal issuance files are hidden from guests', function () {
    Storage::fake(config('filesystems.private_media_disk'));
    $issuance = Issuance::factory()->internal()->create(['file_path' => 'issuances/internal.pdf']);
    Storage::disk(config('filesystems.private_media_disk'))->put('issuances/internal.pdf', '%PDF-1.4');

    $this->get(route('issuances.file', $issuance))->assertNotFound();

    $this->actingAs(User::factory()->create())
        ->get(route('issuances.file', $issuance))
        ->assertOk();
});
