<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PostType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PostRequest;
use App\Http\Resources\PostImageResource;
use App\Models\Post;
use App\Support\Media;
use App\Support\RichText;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::enum(PostType::class)],
            'status' => ['nullable', Rule::in(['published', 'scheduled', 'draft'])],
        ]);

        $posts = Post::query()
            ->search($filters['q'] ?? null)
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => match ($status) {
                'published' => $query->published(),
                'scheduled' => $query->where('published_at', '>', now()),
                default => $query->whereNull('published_at'),
            })
            ->with(['cover', 'author:id,name'])
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/posts/index', [
            'posts' => JsonResource::collection($posts->through(fn (Post $post): array => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'type' => $post->type->value,
                'type_label' => $post->type->label(),
                'status' => $this->status($post),
                'published_at' => $post->published_at?->toIso8601String(),
                'updated_at' => $post->updated_at?->toIso8601String(),
                'author' => $post->author?->name,
                'thumbnail' => Media::url($post->cover?->path),
            ])),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'type' => $filters['type'] ?? '',
                'status' => $filters['status'] ?? '',
            ],
            'types' => $this->typeOptions(),
        ]);
    }

    public function create(Request $request): Response
    {
        $type = PostType::tryFrom((string) $request->query('type')) ?? PostType::Announcement;

        return Inertia::render('admin/posts/form', [
            'post' => null,
            'defaultType' => $type->value,
            'types' => $this->typeOptions(),
        ]);
    }

    public function store(PostRequest $request): RedirectResponse
    {
        $post = new Post;
        $post->author_id = $request->user()?->id;

        $this->save($post, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Post created.']);

        return to_route('admin.posts.edit', $post);
    }

    public function edit(Post $post): Response
    {
        $post->load('images');

        return Inertia::render('admin/posts/form', [
            'post' => [
                'id' => $post->id,
                'type' => $post->type->value,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'position' => $post->position,
                'published_at' => $post->published_at?->format('Y-m-d\TH:i'),
                'closing_at' => $post->closing_at?->format('Y-m-d\TH:i'),
                'youtube_url' => $post->youtube_url,
                'video_url' => Media::url($post->video_path),
                'images' => PostImageResource::collection($post->images),
                'status' => $this->status($post),
                'public_url' => route('posts.show', $post),
            ],
            'defaultType' => $post->type->value,
            'types' => $this->typeOptions(),
        ]);
    }

    public function update(PostRequest $request, Post $post): RedirectResponse
    {
        $this->save($post, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Post updated.']);

        return to_route('admin.posts.edit', $post);
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Post deleted.']);

        return to_route('admin.posts.index');
    }

    /**
     * Persist the post fields and synchronize its uploaded media.
     */
    private function save(Post $post, PostRequest $request): void
    {
        $data = $request->safe()->only(['type', 'title', 'excerpt', 'position', 'published_at', 'closing_at', 'youtube_url']);

        $post->fill($data);
        $post->body = RichText::sanitize($request->validated('body'));
        $post->excerpt = $data['excerpt'] ?? RichText::excerpt($post->body);

        if ($post->type !== PostType::Career) {
            $post->position = null;
            $post->closing_at = null;
        }

        $removeVideo = $request->boolean('remove_video') || $request->hasFile('video');
        $oldVideo = $removeVideo ? $post->video_path : null;

        if ($removeVideo) {
            $post->video_path = null;
        }

        if ($request->hasFile('video')) {
            $post->video_path = Media::store($request->file('video'), 'posts/videos');
        }

        DB::transaction(function () use ($post, $request): void {
            $post->save();

            $post->images()
                ->whereKey($request->validated('removed_images', []))
                ->get()
                ->each->delete();

            foreach (array_values($request->validated('image_order', [])) as $position => $imageId) {
                $post->images()->whereKey($imageId)->update(['sort_order' => $position]);
            }

            $nextPosition = (int) $post->images()->max('sort_order') + 1;

            foreach ($request->file('images', []) as $offset => $file) {
                $this->storeImage($post, $file, $nextPosition + $offset);
            }
        });

        Media::delete($oldVideo);
    }

    private function storeImage(Post $post, UploadedFile $file, int $position): void
    {
        $dimensions = @getimagesize($file->getRealPath()) ?: [null, null];

        $post->images()->create([
            'path' => Media::store($file, 'posts/images'),
            'alt' => $post->title,
            'width' => $dimensions[0],
            'height' => $dimensions[1],
            'sort_order' => $position,
        ]);
    }

    private function status(Post $post): string
    {
        return match (true) {
            $post->published_at === null => 'draft',
            $post->published_at->isFuture() => 'scheduled',
            default => 'published',
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function typeOptions(): array
    {
        return array_map(
            fn (PostType $type): array => ['value' => $type->value, 'label' => $type->label()],
            PostType::cases(),
        );
    }
}
