<?php

namespace App\Http\Controllers;

use App\Http\Resources\IssuanceResource;
use App\Models\Issuance;
use App\Models\IssuanceType;
use App\Support\SearchTerm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;
use Inertia\Response;

class IssuanceController extends Controller
{
    /**
     * Regional memoranda and other issuances. Guests only see public
     * issuances; signed-in staff also see internal ones.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2100'],
        ]);

        $issuances = Issuance::query()
            ->visibleTo($request->user())
            ->with('type')
            ->when($filters['type'] ?? null, fn (Builder $query, string $slug) => $query->whereRelation('type', 'slug', $slug))
            ->when($filters['year'] ?? null, fn (Builder $query, int $year) => $query->whereBetween('issued_on', ["{$year}-01-01", "{$year}-12-31"]))
            ->when(filled($filters['q'] ?? null), function (Builder $query) use ($filters): void {
                $like = SearchTerm::contains((string) $filters['q']);

                $query->where(fn (Builder $query) => $query->where('title', 'like', $like)->orWhere('reference_no', 'like', $like));
            })
            ->latest('issued_on')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $oldest = Issuance::query()->visibleTo($request->user())->min('issued_on');

        return Inertia::render('public/issuances/index', [
            'issuances' => IssuanceResource::collection($issuances),
            'types' => IssuanceType::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'slug']),
            'years' => $oldest === null ? [] : range(now()->year, Date::parse($oldest)->year),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'type' => $filters['type'] ?? '',
                'year' => isset($filters['year']) ? (string) $filters['year'] : '',
            ],
        ]);
    }
}
