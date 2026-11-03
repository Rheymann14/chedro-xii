<?php

namespace Database\Factories;

use App\Models\Download;
use App\Models\DownloadCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Download>
 */
class DownloadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'download_category_id' => DownloadCategory::factory(),
            'title' => fake()->sentence(5),
            'description' => fake()->sentence(),
            'file_path' => 'downloads/'.fake()->uuid().'.pdf',
            'file_name' => 'form.pdf',
            'file_size' => fake()->numberBetween(10_000, 2_000_000),
            'mime_type' => 'application/pdf',
            'sort_order' => 0,
        ];
    }
}
