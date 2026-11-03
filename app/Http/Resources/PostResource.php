<?php

namespace App\Http\Resources;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Post summary used on cards and listings.
 *
 * @mixin Post
 */
class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'position' => $this->position,
            'published_at' => $this->published_at?->toIso8601String(),
            'closing_at' => $this->closing_at?->toIso8601String(),
            'cover' => $this->relationLoaded('cover') && $this->cover !== null
                ? PostImageResource::make($this->cover)
                : null,
        ];
    }
}
