<?php

namespace Database\Factories;

use App\Models\DownloadCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DownloadCategory>
 */
class DownloadCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'sort_order' => 0,
        ];
    }
}
