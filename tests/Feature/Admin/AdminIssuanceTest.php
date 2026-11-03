<?php

use App\Enums\IssuanceVisibility;
use App\Models\Issuance;
use App\Models\IssuanceType;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('issuance files are stored on the private disk', function () {
    Storage::fake(config('filesystems.private_media_disk'));
    $type = IssuanceType::factory()->create();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.issuances.store'), [
            'issuance_type_id' => $type->id,
            'title' => 'Submission of enrollment data',
            'reference_no' => 'RM No. 12, s. 2026',
            'issued_on' => '2026-10-15',
            'visibility' => IssuanceVisibility::Internal->value,
            'file' => UploadedFile::fake()->create('RM-12.pdf', 120, 'application/pdf'),
        ])
        ->assertRedirect(route('admin.issuances.index'));

    $issuance = Issuance::query()->sole();

    expect($issuance->file_name)->toBe('RM-12.pdf')
        ->and($issuance->isInternal())->toBeTrue();

    Storage::disk(config('filesystems.private_media_disk'))->assertExists($issuance->file_path);
});

test('executable or markup files are rejected', function () {
    Storage::fake(config('filesystems.private_media_disk'));

    $this->actingAs(User::factory()->create())
        ->post(route('admin.issuances.store'), [
            'issuance_type_id' => IssuanceType::factory()->create()->id,
            'title' => 'Memo',
            'issued_on' => '2026-10-15',
            'visibility' => IssuanceVisibility::Public->value,
            'file' => UploadedFile::fake()->create('memo.html', 10, 'text/html'),
        ])
        ->assertSessionHasErrors('file');

    expect(Issuance::query()->count())->toBe(0);
});

test('replacing the file deletes the old one', function () {
    $disk = Storage::fake(config('filesystems.private_media_disk'));
    $issuance = Issuance::factory()->create(['file_path' => 'issuances/old.pdf']);
    $disk->put('issuances/old.pdf', '%PDF');

    $this->actingAs(User::factory()->create())
        ->put(route('admin.issuances.update', $issuance), [
            'issuance_type_id' => $issuance->issuance_type_id,
            'title' => $issuance->title,
            'issued_on' => $issuance->issued_on->toDateString(),
            'visibility' => $issuance->visibility->value,
            'file' => UploadedFile::fake()->create('new.pdf', 50, 'application/pdf'),
        ])
        ->assertSessionHasNoErrors();

    $disk->assertMissing('issuances/old.pdf');
    $disk->assertExists($issuance->fresh()->file_path);
});

test('issuance types that still have issuances cannot be deleted', function () {
    $issuance = Issuance::factory()->create();

    $this->actingAs(User::factory()->create())
        ->delete(route('admin.issuance-types.destroy', $issuance->issuance_type_id))
        ->assertRedirect();

    $this->assertModelExists($issuance->type);
});
