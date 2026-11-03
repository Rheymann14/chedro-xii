<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HeiController extends Controller
{
    public function __construct(private PortalService $portal) {}

    /**
     * Directory of higher education institutions in Region XII.
     */
    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $institutions = $this->portal->institutions();

        $all = collect($institutions ?? []);
        $filtered = $this->applyFilters($all, $filters);
        $perPage = 20;
        $page = LengthAwarePaginator::resolveCurrentPage();

        $paginator = (new LengthAwarePaginator(
            $filtered->forPage($page, $perPage)->values(),
            $filtered->count(),
            $perPage,
            $page,
            ['path' => $request->url()],
        ))->withQueryString();

        return Inertia::render('public/heis/index', [
            'institutions' => JsonResource::collection($paginator),
            'available' => $institutions !== null,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'type' => $filters['type'] ?? '',
                'province' => $filters['province'] ?? '',
            ],
            'types' => $all->pluck('type')->filter()->unique()->sort()->values(),
            'provinces' => $all->pluck('province')->filter()->unique()->sort()->values(),
            'total' => $all->count(),
        ]);
    }

    /**
     * Export the (filtered) directory as PDF or XLSX.
     */
    public function export(Request $request, string $format): HttpResponse
    {
        $institutions = $this->portal->institutions();

        abort_if($institutions === null, 503, 'The HEI directory is temporarily unavailable.');

        $rows = $this->applyFilters(collect($institutions), $this->filters($request));
        $fileName = 'region-xii-heis-'.now()->format('Y-m-d');

        if ($format === 'pdf') {
            return Pdf::loadView('exports.heis', ['institutions' => $rows, 'generatedAt' => now()])
                ->setPaper('a4', 'landscape')
                ->download("{$fileName}.pdf");
        }

        return $this->xlsx($rows, "{$fileName}.xlsx");
    }

    /**
     * @return array{q?: string|null, type?: string|null, province?: string|null}
     */
    private function filters(Request $request): array
    {
        return $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
        ]);
    }

    /**
     * @param  Collection<int, array{code: string|null, name: string, type: string|null, province: string|null, city: string|null, address: string|null}>  $institutions
     * @param  array{q?: string|null, type?: string|null, province?: string|null}  $filters
     * @return Collection<int, array{code: string|null, name: string, type: string|null, province: string|null, city: string|null, address: string|null}>
     */
    private function applyFilters(Collection $institutions, array $filters): Collection
    {
        $term = mb_strtolower(trim((string) ($filters['q'] ?? '')));
        $type = $filters['type'] ?? null;
        $province = $filters['province'] ?? null;

        return $institutions
            ->filter(function (array $item) use ($term, $type, $province): bool {
                if (filled($type) && $item['type'] !== $type) {
                    return false;
                }

                if (filled($province) && $item['province'] !== $province) {
                    return false;
                }

                if ($term === '') {
                    return true;
                }

                $haystack = implode(' ', array_filter([$item['name'], $item['city'], $item['province'], $item['type']]));

                return str_contains(mb_strtolower($haystack), $term);
            })
            ->values();
    }

    /**
     * @param  Collection<int, array{code: string|null, name: string, type: string|null, province: string|null, city: string|null, address: string|null}>  $rows
     */
    private function xlsx(Collection $rows, string $fileName): StreamedResponse
    {
        return response()->streamDownload(function () use ($rows): void {
            $writer = new Writer;
            $writer->openToFile('php://output');
            $writer->addRow(Row::fromValuesWithStyle(['Institution', 'Type', 'City / Municipality', 'Province', 'Address'], (new Style)->withFontBold(true)));

            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues([$row['name'], $row['type'] ?? '', $row['city'] ?? '', $row['province'] ?? '', $row['address'] ?? '']));
            }

            $writer->close();
        }, $fileName, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }
}
