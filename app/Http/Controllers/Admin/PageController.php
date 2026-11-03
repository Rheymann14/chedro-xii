<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Models\Page;
use App\Support\RichText;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/pages/index', [
            'pages' => Page::query()
                ->with('author:id,name')
                ->orderBy('title')
                ->get(['id', 'title', 'slug', 'is_published', 'author_id', 'updated_at'])
                ->map(fn (Page $page): array => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'is_published' => $page->is_published,
                    'updated_at' => $page->updated_at?->toIso8601String(),
                    'author' => $page->author?->name,
                    'public_url' => route('pages.show', $page),
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/pages/form', ['page' => null]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $page = new Page($request->safe()->except('body'));
        $page->body = RichText::sanitize($request->validated('body'));
        $page->author_id = $request->user()?->id;
        $page->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Page created.']);

        return to_route('admin.pages.edit', $page);
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('admin/pages/form', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'meta_description' => $page->meta_description,
                'body' => $page->body,
                'is_published' => $page->is_published,
                'public_url' => route('pages.show', $page),
            ],
        ]);
    }

    public function update(PageRequest $request, Page $page): RedirectResponse
    {
        $page->fill($request->safe()->except('body'));
        $page->body = RichText::sanitize($request->validated('body'));
        $page->author_id = $request->user()?->id;
        $page->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Page updated.']);

        return to_route('admin.pages.edit', $page);
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Page deleted.']);

        return to_route('admin.pages.index');
    }
}
