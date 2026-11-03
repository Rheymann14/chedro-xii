<?php

namespace App\Console\Commands;

use App\Enums\PostType;
use App\Enums\UserRole;
use App\Models\Post;
use App\Models\User;
use App\Support\Media;
use App\Support\RichText;
use App\Support\SqlDump;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Http\File;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Symfony\Component\Finder\Finder;

/**
 * One-off migration of the old chedro12 production site: its posts with their
 * images and videos, and its back-office accounts. Files are written to the
 * media disk, so pointing MEDIA_DISK at the bucket uploads them there.
 */
#[Signature('legacy:import
    {dump : Path to the production SQL dump (defaultdb.sql)}
    {files : Folder holding the production public uploads (career-images, career-videos, ...)}')]
#[Description('Import posts, images and accounts from the old chedro12 production site')]
class ImportLegacySite extends Command
{
    /**
     * Old `careerpost.entry_type` values and the post type each becomes.
     *
     * @var array<string, PostType>
     */
    private const array EntryTypes = [
        'career_post' => PostType::Career,
        'posting' => PostType::Announcement,
        'awards_commendation' => PostType::Award,
    ];

    /**
     * Uploads referenced by the imported rows, relative to the files folder.
     *
     * @var array<string, true>
     */
    private array $referencedFiles = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $filesRoot = rtrim((string) $this->argument('files'), '\\/');

        if (! is_dir($filesRoot)) {
            $this->components->error("The files folder {$filesRoot} does not exist.");

            return self::FAILURE;
        }

        try {
            $dump = SqlDump::fromFile((string) $this->argument('dump'));
        } catch (RuntimeException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        $users = $this->importUsers($dump->rows('users'));
        $posts = $this->importPosts($dump->rows('careerpost'), $filesRoot);

        $this->newLine();
        $this->components->twoColumnDetail('<fg=green>Accounts imported</>', (string) $users['imported']);
        $this->components->twoColumnDetail('Accounts skipped (email already registered)', (string) $users['skipped']);
        $this->components->twoColumnDetail('<fg=green>Posts imported</>', (string) $posts['imported']);
        $this->components->twoColumnDetail('Posts skipped (already imported)', (string) $posts['skipped']);
        $this->components->twoColumnDetail('<fg=green>Already imported posts given their missing images</>', (string) $posts['backfilled']);
        $this->components->twoColumnDetail('<fg=yellow>Undated posts given the previous post\'s date</>', (string) $posts['dated']);
        $this->components->twoColumnDetail('<fg=green>Images stored</>', (string) $posts['images']);
        $this->components->twoColumnDetail('<fg=green>Videos stored</>', (string) $posts['videos']);

        $this->reportUnreferencedFiles($filesRoot);

        return self::SUCCESS;
    }

    /**
     * Copy accounts across with their existing password hashes, so staff keep
     * their passwords. Accounts whose email is already registered are left alone.
     *
     * @param  list<array<string, string|null>>  $rows
     * @return array{imported: int, skipped: int}
     */
    private function importUsers(array $rows): array
    {
        $result = ['imported' => 0, 'skipped' => 0];

        foreach ($rows as $row) {
            $email = mb_strtolower(trim((string) $row['email']));

            if (User::query()->where('email', $email)->exists()) {
                $result['skipped']++;

                continue;
            }

            // Inserted without the model so the "hashed" cast keeps the legacy hash as is.
            User::query()->insert([
                'name' => $row['name'],
                'email' => $email,
                'password' => $row['password'],
                'role' => ($row['role'] === 'admin' ? UserRole::Admin : UserRole::Editor)->value,
                'is_active' => ($row['status'] ?? 'active') === 'active',
                'email_verified_at' => $row['email_verified_at'] ?? $row['created_at'] ?? now(),
                'created_at' => $row['created_at'] ?? now(),
                'updated_at' => $row['updated_at'] ?? now(),
            ]);

            $result['imported']++;
        }

        return $result;
    }

    /**
     * @param  list<array<string, string|null>>  $rows
     * @return array{imported: int, skipped: int, backfilled: int, images: int, videos: int, dated: int}
     */
    private function importPosts(array $rows, string $filesRoot): array
    {
        $result = ['imported' => 0, 'skipped' => 0, 'backfilled' => 0, 'images' => 0, 'videos' => 0, 'dated' => 0];
        $previousDate = null;

        usort($rows, fn (array $first, array $second): int => (int) $first['id'] <=> (int) $second['id']);

        $this->withProgressBar($rows, function (array $row) use ($filesRoot, &$result, &$previousDate): void {
            $type = self::EntryTypes[$row['entry_type'] ?? ''] ?? PostType::Announcement;

            // The old site listed undated posts too; date them like the post before them, since ids follow posting order.
            $postedDate = $row['posted_date'] ?? $previousDate;
            $previousDate = $postedDate;
            $publishedAt = $postedDate === null ? null : Carbon::parse($postedDate)->startOfDay();
            $title = trim((string) $row['headline']);
            $imagePaths = $this->legacyPaths($row['Poster']);
            $videoPath = $this->legacyPaths($row['Video'])[0] ?? null;

            foreach ([...$imagePaths, ...array_filter([$videoPath])] as $path) {
                $this->referencedFiles[$path] = true;
            }

            $existing = Post::query()
                ->where('type', $type)
                ->where('title', $title)
                ->where('published_at', $publishedAt)
                ->first();

            if ($existing !== null) {
                $result['skipped']++;

                // Images whose files were missing on an earlier run are added once they are available.
                if ($imagePaths !== [] && $existing->images()->doesntExist()) {
                    $stored = DB::transaction(fn (): int => $this->storeImages($existing, $imagePaths, $filesRoot));
                    $result['images'] += $stored;
                    $result['backfilled'] += $stored > 0 ? 1 : 0;
                }

                return;
            }

            $post = new Post([
                'type' => $type,
                'title' => $title,
                'published_at' => $publishedAt,
            ]);
            $post->body = RichText::sanitize($row['description']);
            $post->excerpt = RichText::excerpt($post->body);
            $post->created_at = $publishedAt ?? now();
            $post->updated_at = $publishedAt ?? now();

            if ($type === PostType::Career) {
                $post->position = $row['career'] === null ? null : trim($row['career']);
                $post->closing_at = $row['closing_date'] === null ? null : Carbon::parse($row['closing_date'])->endOfDay();
            }

            if ($videoPath !== null && is_file("{$filesRoot}/{$videoPath}")) {
                $post->video_path = (string) Media::disk()->putFile('posts/videos', new File("{$filesRoot}/{$videoPath}"), 'public');
                $result['videos']++;
            } elseif ($videoPath !== null) {
                $this->missingFile($videoPath, $title);
            }

            if ($row['posted_date'] === null && $publishedAt !== null) {
                $result['dated']++;
            }

            DB::transaction(function () use ($post, $imagePaths, $filesRoot, &$result): void {
                $post->save();

                $result['images'] += $this->storeImages($post, $imagePaths, $filesRoot);
            });

            $result['imported']++;
        });

        $this->newLine();

        return $result;
    }

    /**
     * Optimize the post's legacy images onto the media disk, reporting any
     * that are missing from the files folder, and return how many were stored.
     *
     * @param  list<string>  $imagePaths
     */
    private function storeImages(Post $post, array $imagePaths, string $filesRoot): int
    {
        $count = 0;

        foreach ($imagePaths as $position => $imagePath) {
            if (! is_file("{$filesRoot}/{$imagePath}")) {
                $this->missingFile($imagePath, $post->title);

                continue;
            }

            $stored = Media::storeImage(new File("{$filesRoot}/{$imagePath}"), ['posts/images' => 2560, 'posts/thumbnails' => 800]);

            $post->images()->create([
                'path' => $stored['posts/images']['path'],
                'thumbnail_path' => $stored['posts/thumbnails']['path'],
                'alt' => $post->title,
                'width' => $stored['posts/images']['width'],
                'height' => $stored['posts/images']['height'],
                'sort_order' => $position,
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Normalize a legacy upload column, which holds either a JSON list of paths
     * or a single path, into a list of paths relative to the files folder.
     *
     * @return list<string>
     */
    private function legacyPaths(?string $value): array
    {
        if ($value === null || trim($value) === '') {
            return [];
        }

        $decoded = json_decode($value, true);
        $paths = is_array($decoded) ? $decoded : [$value];

        return array_values(array_filter(array_map(
            fn (mixed $path): string => is_string($path) ? ltrim(str_replace('\\', '/', trim($path)), '/') : '',
            $paths,
        )));
    }

    private function missingFile(string $path, string $title): void
    {
        $this->newLine();
        $this->components->warn("Missing file {$path} for \"{$title}\"; skipped.");
    }

    /**
     * List how many uploads in each folder no imported row points to, since
     * those files have no record to attach them to.
     */
    private function reportUnreferencedFiles(string $filesRoot): void
    {
        $unreferenced = [];

        foreach (Finder::create()->files()->in($filesRoot)->depth('> 0') as $file) {
            $relativePath = str_replace('\\', '/', $file->getRelativePathname());

            if (! isset($this->referencedFiles[$relativePath])) {
                $folder = str_replace('\\', '/', $file->getRelativePath());
                $unreferenced[$folder] = ($unreferenced[$folder] ?? 0) + 1;
            }
        }

        if ($unreferenced === []) {
            return;
        }

        $this->newLine();
        $this->components->warn('These uploads are not referenced by any imported record and were not copied:');

        foreach ($unreferenced as $folder => $count) {
            $this->components->twoColumnDetail($folder, "{$count} files");
        }
    }
}
