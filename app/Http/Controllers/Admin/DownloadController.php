<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DownloadRequest;
use App\Models\Download;
use App\Models\DownloadCategory;
use App\Support\Media;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Inertia\Inertia;
use Inertia\Response;

class DownloadController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'category' => ['nullable', 'integer'],
        ]);

        $downloads = Download::query()
            ->with('category')
            ->when($filters['category'] ?? null, fn (Builder $query, int $category) => $query->where('download_category_id', $category))
            ->orderBy('download_category_id')
            ->orderBy('sort_order')
            ->orderBy('title')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/downloads/index', [
            'downloads' => JsonResource::collection($downloads->through(fn (Download $download): array => [
                'id' => $download->id,
                'title' => $download->title,
                'category' => $download->category->name,
                'file_name' => $download->file_name,
                'file_size' => $download->file_size,
                'file_url' => Media::url($download->file_path),
            ])),
            'filters' => ['category' => isset($filters['category']) ? (string) $filters['category'] : ''],
            'categories' => $this->categories(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/downloads/form', [
            'download' => null,
            'categories' => $this->categories(),
        ]);
    }

    public function store(DownloadRequest $request): RedirectResponse
    {
        $download = new Download($request->safe()->except('file'));
        $download->sort_order ??= 0;
        $download->author_id = $request->user()?->id;
        $this->attachFile($download, $request);
        $download->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File uploaded.']);

        return to_route('admin.downloads.index');
    }

    public function edit(Download $download): Response
    {
        return Inertia::render('admin/downloads/form', [
            'download' => [
                'id' => $download->id,
                'download_category_id' => $download->download_category_id,
                'title' => $download->title,
                'description' => $download->description,
                'sort_order' => $download->sort_order,
                'file_name' => $download->file_name,
                'file_url' => Media::url($download->file_path),
            ],
            'categories' => $this->categories(),
        ]);
    }

    public function update(DownloadRequest $request, Download $download): RedirectResponse
    {
        $download->fill($request->safe()->except('file'));
        $download->sort_order ??= 0;
        $oldFile = $request->hasFile('file') ? $download->file_path : null;
        $this->attachFile($download, $request);
        $download->save();

        Media::delete($oldFile);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File updated.']);

        return to_route('admin.downloads.index');
    }

    public function destroy(Download $download): RedirectResponse
    {
        $download->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File deleted.']);

        return back();
    }

    private function attachFile(Download $download, DownloadRequest $request): void
    {
        $file = $request->file('file');

        if ($file === null) {
            return;
        }

        $download->file_path = Media::store($file, 'downloads');
        $download->file_name = $file->getClientOriginalName();
        $download->file_size = $file->getSize();
        $download->mime_type = $file->getMimeType();
    }

    /**
     * @return Collection<int, DownloadCategory>
     */
    private function categories(): Collection
    {
        return DownloadCategory::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name']);
    }
}
