<?php

namespace Database\Seeders;

use App\Models\DownloadCategory;
use App\Models\IssuanceType;
use Illuminate\Database\Seeder;

class TaxonomySeeder extends Seeder
{
    /**
     * Seed default issuance types and download categories.
     */
    public function run(): void
    {
        foreach (['Regional Memorandum', 'Regional Advisory', 'Regional Memorandum Order', 'Special Order'] as $position => $name) {
            IssuanceType::query()->firstOrCreate(['name' => $name], ['sort_order' => $position]);
        }

        foreach (['Scholarship Forms', 'HEI Forms', 'Certification, Authentication and Verification', 'General Forms'] as $position => $name) {
            DownloadCategory::query()->firstOrCreate(['name' => $name], ['sort_order' => $position]);
        }
    }
}
