<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Client for the CHEDRO XII portal API that lists higher education
 * institutions (HEIs) in the region.
 */
class PortalService
{
    public const CACHE_KEY = 'portal.heis.v2';

    /**
     * Institution types, in display order.
     *
     * @var list<string>
     */
    public const TYPES = ['SUC', 'LUC', 'Private'];

    /**
     * @var array<string, string>
     */
    private const OWNERSHIP_LABELS = [
        'CSCU-MAIN' => 'State University',
        'CSCU-SAT' => 'State University (Satellite)',
        'CSU' => 'State University',
        'LGCU' => 'Local University / College',
        'LUC' => 'Local University / College',
        'LOCAL' => 'Local University / College',
        'NATIONAL' => 'National Government',
        'OGS' => 'Other Government School',
        'PRIVATE' => 'Private',
        'PSS' => 'Private Sectarian',
        'PSN' => 'Private Sectarian',
        'PRIVATE SECTARIAN' => 'Private Sectarian',
        'PNN' => 'Private Non-Sectarian',
        'PNF' => 'Private Non-Sectarian',
        'PNS' => 'Private Non-Sectarian',
        'PRIVATE NON-SECTARIAN' => 'Private Non-Sectarian',
    ];

    /**
     * All HEIs, sorted by name. Returns null when the portal is unreachable
     * and nothing has been cached yet.
     *
     * @return list<array{code: string|null, name: string, type: string|null, ownership: string|null, province: string|null, city: string|null, address: string|null}>|null
     */
    public function institutions(): ?array
    {
        try {
            return Cache::flexible(self::CACHE_KEY, [now()->addHour(), now()->addDay()], fn (): array => $this->fetchInstitutions());
        } catch (ConnectionException|RequestException|RuntimeException $exception) {
            Log::warning('Unable to load HEIs from the CHEDRO XII portal.', ['message' => $exception->getMessage()]);

            return null;
        }
    }

    /**
     * @return list<array{code: string|null, name: string, type: string|null, ownership: string|null, province: string|null, city: string|null, address: string|null}>
     *
     * @throws ConnectionException
     * @throws RequestException
     */
    private function fetchInstitutions(): array
    {
        $key = config('services.portal.key');

        if (blank($key)) {
            throw new RuntimeException('The portal API key is not configured.');
        }

        $caBundle = config('services.portal.ca_bundle');

        $payload = Http::baseUrl((string) config('services.portal.url'))
            ->withHeaders(['PORTAL-API' => $key])
            ->when(filled($caBundle), fn (PendingRequest $request): PendingRequest => $request->withOptions(['verify' => $caBundle]))
            ->acceptJson()
            ->timeout((int) config('services.portal.timeout'))
            ->retry(2, 500, throw: true)
            ->get('fetch-all-hei')
            ->throw()
            ->json();

        if (! is_array($payload)) {
            throw new RuntimeException('The portal returned an unexpected response.');
        }

        return array_values(collect($payload)
            ->filter(fn (mixed $item): bool => is_array($item) && filled($item['instName'] ?? null))
            ->map(fn (array $item): array => [
                'code' => $this->clean($item['instCode'] ?? null),
                'name' => (string) $this->clean($item['instName']),
                'type' => $this->institutionType($item['ownershipHei_type'] ?? null, $item['instOwnership'] ?? null),
                'ownership' => $this->ownershipLabel($item['instOwnership'] ?? null),
                'province' => $this->clean($item['province'] ?? null),
                'city' => $this->clean($item['municipalityCity'] ?? null),
                'address' => $this->clean($item['address'] ?? null),
            ])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->all());
    }

    /**
     * Group an HEI into SUC, LUC, or Private, preferring the portal's HEI type
     * and falling back to the ownership code.
     */
    private function institutionType(mixed $heiType, mixed $ownership): ?string
    {
        $heiType = strtoupper((string) $this->clean($heiType));
        $ownership = strtoupper((string) $this->clean($ownership));

        return match (true) {
            str_starts_with($heiType, 'SUC'), str_starts_with($ownership, 'CSCU'), $ownership === 'CSU' => 'SUC',
            $heiType === 'LUC', in_array($ownership, ['LGCU', 'LUC', 'LOCAL'], true) => 'LUC',
            $heiType === 'PRIVATE', str_starts_with($ownership, 'P') => 'Private',
            default => null,
        };
    }

    private function ownershipLabel(mixed $ownership): ?string
    {
        $ownership = $this->clean($ownership);

        return $ownership === null ? null : (self::OWNERSHIP_LABELS[strtoupper($ownership)] ?? $ownership);
    }

    private function clean(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
