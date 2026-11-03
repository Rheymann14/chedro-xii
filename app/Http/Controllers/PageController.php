<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(Page $page): Response
    {
        abort_unless($page->is_published || Gate::allows('manage-content'), 404);

        return Inertia::render('public/page', [
            'page' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'meta_description' => $page->meta_description,
                'body' => $page->body,
                'updated_at' => $page->updated_at?->toIso8601String(),
            ],
        ]);
    }
}
