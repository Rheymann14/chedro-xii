<?php

namespace Database\Factories;

use App\Enums\IssuanceVisibility;
use App\Models\Issuance;
use App\Models\IssuanceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Issuance>
 */
class IssuanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'issuance_type_id' => IssuanceType::factory(),
            'title' => fake()->sentence(8),
            'reference_no' => 'RM No. '.fake()->numberBetween(1, 200).', s. '.now()->year,
            'issued_on' => fake()->dateTimeBetween('-2 years'),
            'file_path' => 'issuances/'.fake()->uuid().'.pdf',
            'file_name' => 'memo.pdf',
            'visibility' => IssuanceVisibility::Public,
        ];
    }

    public function internal(): static
    {
        return $this->state(fn (array $attributes) => ['visibility' => IssuanceVisibility::Internal]);
    }
}
