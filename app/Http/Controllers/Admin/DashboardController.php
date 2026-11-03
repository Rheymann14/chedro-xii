<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\ContactMessage;
use App\Models\Download;
use App\Models\Issuance;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'published_posts' => Post::query()->published()->count(),
                'scheduled_posts' => Post::query()->where('published_at', '>', now())->count(),
                'draft_posts' => Post::query()->whereNull('published_at')->count(),
                'issuances' => Issuance::query()->count(),
                'downloads' => Download::query()->count(),
                'active_banners' => Banner::query()->showing()->count(),
                'unread_messages' => Gate::allows('administer') ? ContactMessage::query()->unread()->count() : null,
            ],
            'recentPosts' => Post::query()
                ->latest('updated_at')
                ->limit(6)
                ->get(['id', 'type', 'title', 'published_at', 'updated_at'])
                ->map(fn (Post $post): array => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'type_label' => $post->type->label(),
                    'is_published' => $post->isPublished(),
                    'updated_at' => $post->updated_at?->toIso8601String(),
                ]),
        ]);
    }
}
