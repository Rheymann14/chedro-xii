<?php

namespace Database\Factories;

use App\Enums\PostType;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => PostType::Announcement,
            'title' => fake()->sentence(6),
            'excerpt' => fake()->sentence(18),
            'body' => '<p>'.fake()->paragraph().'</p>',
            'published_at' => now()->subDay(),
        ];
    }

    public function ofType(PostType $type): static
    {
        return $this->state(fn (array $attributes) => ['type' => $type]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => ['published_at' => null]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => ['published_at' => now()->addWeek()]);
    }
}
