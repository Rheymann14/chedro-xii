<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'image_path' => 'banners/'.fake()->uuid().'.jpg',
            'alt' => fake()->sentence(6),
            'link_url' => null,
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
