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
use OpenSpout\Common\Entity\Style\Border;
use OpenSpout\Common\Entity\Style\BorderName;
use OpenSpout\Common\Entity\Style\BorderPart;
use OpenSpout\Common\Entity\Style\BorderWidth;
use OpenSpout\Common\Entity\Style\CellVerticalAlignment;
use OpenSpout\Common\Entity\Style\Color;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\AutoFilter;
use OpenSpout\Writer\XLSX\Entity\SheetView;
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
            'types' => PortalService::TYPES,
            'provinces' => $all->pluck('province')->filter()->unique()->sort()->values(),
            'total' => $all->count(),
            'counts' => collect(PortalService::TYPES)
                ->mapWithKeys(fn (string $type): array => [$type => $all->where('type', $type)->count()]),
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
     * @param  Collection<int, array{code: string|null, name: string, type: string|null, ownership: string|null, province: string|null, city: string|null, address: string|null}>  $institutions
     * @param  array{q?: string|null, type?: string|null, province?: string|null}  $filters
     * @return Collection<int, array{code: string|null, name: string, type: string|null, ownership: string|null, province: string|null, city: string|null, address: string|null}>
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

                $haystack = implode(' ', array_filter([$item['code'], $item['name'], $item['city'], $item['province'], $item['type'], $item['ownership']]));

                return str_contains(mb_strtolower($haystack), $term);
            })
            ->values();
    }

    /**
     * @param  Collection<int, array{code: string|null, name: string, type: string|null, ownership: string|null, province: string|null, city: string|null, address: string|null}>  $rows
     */
    private function xlsx(Collection $rows, string $fileName): StreamedResponse
    {
        $headers = ['UII', 'Institution', 'Type', 'Ownership', 'City / Municipality', 'Province', 'Address'];
        $values = $rows->map(fn (array $row): array => [
            $row['code'] ?? '',
            $row['name'],
            $row['type'] ?? '',
            $row['ownership'] ?? '',
            $row['city'] ?? '',
            $row['province'] ?? '',
            $row['address'] ?? '',
        ]);

        return response()->streamDownload(function () use ($headers, $values): void {
            $border = new Border(...array_map(
                fn (BorderName $name): BorderPart => new BorderPart($name, 'BFBFBF', BorderWidth::THIN),
                BorderName::cases(),
            ));
            $cellStyle = (new Style)
                ->withBorder($border)
                ->withShouldWrapText(true)
                ->withCellVerticalAlignment(CellVerticalAlignment::CENTER);
            $headerStyle = $cellStyle
                ->withFontBold(true)
                ->withFontColor(Color::WHITE)
                ->withBackgroundColor('1E2B5E');

            $writer = new Writer;
            $writer->openToFile('php://output');

            $sheet = $writer->getCurrentSheet();
            $sheet->setName('HEIs');
            $sheet->setSheetView((new SheetView)->withFreezeRow(2));
            $sheet->setAutoFilter(new AutoFilter(0, 1, count($headers) - 1, $values->count() + 1));

            foreach ($this->columnWidths($headers, $values) as $index => $width) {
                $sheet->setColumnWidth($width, $index + 1);
            }

            $writer->addRow(Row::fromValuesWithStyle($headers, $headerStyle));

            foreach ($values as $value) {
                $writer->addRow(Row::fromValuesWithStyle($value, $cellStyle));
            }

            $writer->close();
        }, $fileName, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    /**
     * Size each column to its longest value, capped so long text wraps instead of stretching the sheet.
     *
     * @param  list<string>  $headers
     * @param  Collection<int, list<string>>  $values
     * @return list<float>
     */
    private function columnWidths(array $headers, Collection $values): array
    {
        return array_map(function (int $index) use ($headers, $values): float {
            $longest = $values
                ->map(fn (array $value): int => mb_strlen((string) $value[$index]))
                ->push(mb_strlen($headers[$index]) + 4)
                ->max();

            return (float) min(max($longest + 2, 10), 50);
        }, array_keys($headers));
    }
}
