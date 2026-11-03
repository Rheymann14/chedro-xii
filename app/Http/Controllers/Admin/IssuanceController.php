<?php

namespace App\Http\Controllers\Admin;

use App\Enums\IssuanceVisibility;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IssuanceRequest;
use App\Models\Issuance;
use App\Models\IssuanceType;
use App\Support\Media;
use App\Support\SearchTerm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Inertia\Inertia;
use Inertia\Response;

class IssuanceController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'integer'],
        ]);

        $issuances = Issuance::query()
            ->with('type')
            ->when($filters['type'] ?? null, fn (Builder $query, int $type) => $query->where('issuance_type_id', $type))
            ->when(filled($filters['q'] ?? null), function (Builder $query) use ($filters): void {
                $like = SearchTerm::contains((string) $filters['q']);

                $query->where(fn (Builder $query) => $query->where('title', 'like', $like)->orWhere('reference_no', 'like', $like));
            })
            ->latest('issued_on')
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/issuances/index', [
            'issuances' => JsonResource::collection($issuances->through(fn (Issuance $issuance): array => [
                'id' => $issuance->id,
                'title' => $issuance->title,
                'reference_no' => $issuance->reference_no,
                'issued_on' => $issuance->issued_on->toDateString(),
                'type' => $issuance->type->name,
                'is_internal' => $issuance->isInternal(),
                'file_url' => route('issuances.file', $issuance),
                'file_name' => $issuance->file_name,
            ])),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'type' => isset($filters['type']) ? (string) $filters['type'] : '',
            ],
            'types' => $this->types(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/issuances/form', [
            'issuance' => null,
            'types' => $this->types(),
            'visibilities' => $this->visibilities(),
        ]);
    }

    public function store(IssuanceRequest $request): RedirectResponse
    {
        $issuance = new Issuance($request->safe()->except('file'));
        $issuance->author_id = $request->user()?->id;
        $this->attachFile($issuance, $request);
        $issuance->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Issuance published.']);

        return to_route('admin.issuances.index');
    }

    public function edit(Issuance $issuance): Response
    {
        return Inertia::render('admin/issuances/form', [
            'issuance' => [
                'id' => $issuance->id,
                'issuance_type_id' => $issuance->issuance_type_id,
                'title' => $issuance->title,
                'reference_no' => $issuance->reference_no,
                'issued_on' => $issuance->issued_on->toDateString(),
                'visibility' => $issuance->visibility->value,
                'file_name' => $issuance->file_name,
                'file_url' => route('issuances.file', $issuance),
            ],
            'types' => $this->types(),
            'visibilities' => $this->visibilities(),
        ]);
    }

    public function update(IssuanceRequest $request, Issuance $issuance): RedirectResponse
    {
        $issuance->fill($request->safe()->except('file'));
        $oldFile = $request->hasFile('file') ? $issuance->file_path : null;
        $this->attachFile($issuance, $request);
        $issuance->save();

        Media::deletePrivately($oldFile);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Issuance updated.']);

        return to_route('admin.issuances.index');
    }

    public function destroy(Issuance $issuance): RedirectResponse
    {
        $issuance->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Issuance deleted.']);

        return back();
    }

    private function attachFile(Issuance $issuance, IssuanceRequest $request): void
    {
        $file = $request->file('file');

        if ($file === null) {
            return;
        }

        $issuance->file_path = Media::storePrivately($file, 'issuances');
        $issuance->file_name = $file->getClientOriginalName();
    }

    /**
     * @return Collection<int, IssuanceType>
     */
    private function types(): Collection
    {
        return IssuanceType::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name']);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function visibilities(): array
    {
        return array_map(
            fn (IssuanceVisibility $visibility): array => ['value' => $visibility->value, 'label' => $visibility->label()],
            IssuanceVisibility::cases(),
        );
    }
}
