<?php

namespace Database\Factories;

use App\Models\SiteCounter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteCounter>
 */
class SiteCounterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => fake()->unique()->word(),
            'value' => fake()->numberBetween(0, 10_000),
        ];
    }
}
