<?php

namespace Database\Factories;

use App\Enums\MenuLocation;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'menu' => MenuLocation::Header,
            'label' => fake()->words(2, true),
            'url' => '/'.fake()->slug(2),
            'opens_in_new_tab' => false,
            'sort_order' => 0,
        ];
    }
}
