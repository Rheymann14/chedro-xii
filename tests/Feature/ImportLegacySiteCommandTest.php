<?php

use App\Enums\PostType;
use App\Enums\UserRole;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * Write a legacy dump and uploads folder to a fake disk and return its path.
 *
 * @param  list<string>  $careerposts  value tuples for the careerpost INSERT
 * @param  list<string>  $users  value tuples for the users INSERT
 * @param  list<string>  $files  upload paths to create
 */
function legacySite(array $careerposts = [], array $users = [], array $files = []): string
{
    $source = Storage::fake('legacy-source');

    $sql = "CREATE TABLE \"careerpost\" (\"id\" bigint unsigned NOT NULL AUTO_INCREMENT);\n";

    if ($careerposts !== []) {
        $sql .= "INSERT INTO `careerpost` (`id`, `headline`, `description`, `posted_date`, `closing_date`, `career`, `Poster`, `placeholder_images`, `blurhash`, `Video`, `entry_type`) VALUES\n"
            .implode(",\n", $careerposts).";\n";
    }

    if ($users !== []) {
        $sql .= "INSERT INTO `users` (`id`, `name`, `email`, `role`, `status`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES\n"
            .implode(",\n", $users).";\n";
    }

    $source->put('defaultdb.sql', $sql);

    foreach ($files as $file) {
        $source->put($file, UploadedFile::fake()->image('upload.jpg', 3000, 2000)->getContent());
    }

    return $source->path('');
}

test('it imports legacy posts by entry type with optimized images', function () {
    $media = Storage::fake(config('filesystems.media_disk'));
    $root = legacySite(
        careerposts: [
            <<<'SQL'
            (2, 'WE ARE HIRING EDUCATION SUPERVISOR II', '<p class=\"text-blue-600\">Submit the required documents at <a href=\"https://chedro12.ched.gov.ph/\">our office</a>.</p>', '2024-12-13', '2024-12-23', 'Education Supervisor II', '[\"career-images\\/hiring.jpg\"]', NULL, NULL, NULL, 'career_post')
            SQL,
            <<<'SQL'
            (21, 'HONORING A REMARKABLE JOURNEY', '<p>Ma\'am Norie\'s 44 years of service.</p>', '2024-11-28', '2024-11-28', NULL, '[\"career-images\\/first.jpg\",\"career-images\\/second.jpg\"]', NULL, NULL, NULL, 'posting')
            SQL,
            <<<'SQL'
            (30, 'EQUATE Awardees', '<p> </p>', '2025-04-02', NULL, NULL, NULL, NULL, NULL, NULL, 'awards_commendation')
            SQL,
        ],
        files: ['career-images/hiring.jpg', 'career-images/first.jpg', 'career-images/second.jpg', 'career-videos/orphan.mp4'],
    );

    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])
        ->expectsOutputToContain('career-videos')
        ->assertSuccessful();

    $career = Post::query()->where('type', PostType::Career)->sole();
    expect($career->title)->toBe('WE ARE HIRING EDUCATION SUPERVISOR II')
        ->and($career->position)->toBe('Education Supervisor II')
        ->and($career->published_at->toDateTimeString())->toBe('2024-12-13 00:00:00')
        ->and($career->closing_at->toDateTimeString())->toBe('2024-12-23 23:59:59')
        ->and($career->body)->toBe('<p>Submit the required documents at <a href="https://chedro12.ched.gov.ph/" rel="noopener noreferrer">our office</a>.</p>')
        ->and($career->excerpt)->toBe('Submit the required documents at our office .');

    $announcement = Post::query()->where('type', PostType::Announcement)->sole();
    expect($announcement->body)->toBe('<p>Ma&#039;am Norie&#039;s 44 years of service.</p>')
        ->and($announcement->closing_at)->toBeNull()
        ->and($announcement->images()->count())->toBe(2);

    $award = Post::query()->where('type', PostType::Award)->sole();
    expect($award->body)->toBeNull()
        ->and($award->images()->count())->toBe(0);

    $image = $career->images()->sole();
    expect($image->path)->toStartWith('posts/images/')->toEndWith('.webp')
        ->and($image->width)->toBe(2560)
        ->and($image->alt)->toBe('WE ARE HIRING EDUCATION SUPERVISOR II');
    $media->assertExists([$image->path, $image->thumbnail_path]);
});

test('undated posts take the date of the post before them', function () {
    Storage::fake(config('filesystems.media_disk'));
    $root = legacySite(careerposts: [
        "(59, 'Welcomes Universitas Negeri Malang', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'posting')",
        "(58, 'Scholarship for staff', NULL, '2025-08-04', '2025-09-08', NULL, NULL, NULL, NULL, NULL, 'posting')",
    ]);

    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])->assertSuccessful();

    expect(Post::query()->where('title', 'Welcomes Universitas Negeri Malang')->sole()->published_at->toDateString())
        ->toBe('2025-08-04');
});

test('accounts keep their passwords and already registered emails are skipped', function () {
    Storage::fake(config('filesystems.media_disk'));
    $existing = User::factory()->create(['email' => 'rcuartocruz@ched.gov.ph', 'name' => 'Current Name']);
    $legacyHash = password_hash('legacy-password', PASSWORD_BCRYPT, ['cost' => 12]);
    $root = legacySite(users: [
        "(13, 'Admin', 'Chedro12@gmail.com', 'admin', 'active', NULL, '{$legacyHash}', NULL, '2025-10-28 22:29:42', '2025-10-28 22:29:42')",
        "(16, 'Rheymann', 'rcuartocruz@ched.gov.ph', 'admin', 'active', NULL, '{$legacyHash}', NULL, '2026-03-18 14:20:19', '2026-03-18 14:20:30')",
        "(18, 'Former Staff', 'former@ched.gov.ph', 'user', 'inactive', NULL, '{$legacyHash}', NULL, '2025-01-01 08:00:00', '2025-01-01 08:00:00')",
    ]);

    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])->assertSuccessful();

    $admin = User::query()->where('email', 'chedro12@gmail.com')->sole();
    expect($admin->role)->toBe(UserRole::Admin)
        ->and($admin->is_active)->toBeTrue()
        ->and($admin->email_verified_at->toDateTimeString())->toBe('2025-10-28 22:29:42')
        ->and(Hash::check('legacy-password', $admin->password))->toBeTrue();

    $former = User::query()->where('email', 'former@ched.gov.ph')->sole();
    expect($former->role)->toBe(UserRole::Editor)
        ->and($former->is_active)->toBeFalse();

    expect($existing->fresh()->name)->toBe('Current Name')
        ->and(User::query()->count())->toBe(3);
});

test('running the import again does not duplicate posts or accounts', function () {
    Storage::fake(config('filesystems.media_disk'));
    $root = legacySite(
        careerposts: ["(5, 'CHEDROs unite', '<p>Body</p>', '2025-02-03', NULL, NULL, '[\"career-images\\/unite.jpg\"]', NULL, NULL, NULL, 'posting')"],
        users: ["(13, 'Admin', 'chedro12@gmail.com', 'admin', 'active', NULL, 'hash', NULL, NULL, NULL)"],
        files: ['career-images/unite.jpg'],
    );
    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])->assertSuccessful();

    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])->assertSuccessful();

    expect(Post::query()->count())->toBe(1)
        ->and(Post::query()->sole()->images()->count())->toBe(1)
        ->and(User::query()->count())->toBe(1);
});

test('missing image files are reported and the post is still imported', function () {
    Storage::fake(config('filesystems.media_disk'));
    $root = legacySite(careerposts: [
        "(7, 'Year-end assessment', NULL, '2024-12-19', NULL, NULL, '[\"career-images\\/gone.jpg\"]', NULL, NULL, NULL, 'posting')",
    ]);

    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])
        ->expectsOutputToContain('Missing file career-images/gone.jpg')
        ->assertSuccessful();

    expect(Post::query()->sole()->images()->count())->toBe(0);
});

test('running the import again adds images that were missing from an earlier run', function () {
    $media = Storage::fake(config('filesystems.media_disk'));
    $root = legacySite(careerposts: [
        "(7, 'Year-end assessment', NULL, '2024-12-19', NULL, NULL, '[\"career-images\\/late.jpg\"]', NULL, NULL, NULL, 'posting')",
    ]);
    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])->assertSuccessful();
    Storage::disk('legacy-source')->put('career-images/late.jpg', UploadedFile::fake()->image('late.jpg', 3000, 2000)->getContent());

    $this->artisan('legacy:import', ['dump' => $root.'defaultdb.sql', 'files' => $root])->assertSuccessful();

    $image = Post::query()->sole()->images()->sole();
    expect($image->path)->toEndWith('.webp')
        ->and($image->width)->toBe(2560);
    $media->assertExists([$image->path, $image->thumbnail_path]);
});

test('it fails when the dump cannot be read', function () {
    $root = legacySite();

    $this->artisan('legacy:import', ['dump' => $root.'missing.sql', 'files' => $root])
        ->expectsOutputToContain('Unable to read the SQL dump')
        ->assertFailed();

    expect(Post::query()->count())->toBe(0);
});
