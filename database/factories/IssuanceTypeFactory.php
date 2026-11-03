<?php

namespace Database\Factories;

use App\Models\IssuanceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<IssuanceType>
 */
class IssuanceTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'sort_order' => 0,
        ];
    }
}
