<?php

namespace App\Http\Resources;

use App\Models\Post;
use App\Support\Media;
use Illuminate\Http\Request;

/**
 * Full post, including body, gallery, and video, for the detail page.
 *
 * @mixin Post
 */
class PostDetailResource extends PostResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $images = PostImageResource::collection($this->whenLoaded('images'));

        return [
            ...parent::toArray($request),
            'cover' => $this->relationLoaded('images') && $this->images->isNotEmpty()
                ? PostImageResource::make($this->images->first())
                : null,
            'body' => $this->body,
            'images' => $images,
            'video_url' => Media::url($this->video_path),
            'youtube_id' => $this->youtube_id,
        ];
    }
}
