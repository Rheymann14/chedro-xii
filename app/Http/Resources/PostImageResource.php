<?php

namespace App\Http\Resources;

use App\Models\PostImage;
use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PostImage
 */
class PostImageResource extends JsonResource
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
            'url' => Media::url($this->path),
            'alt' => $this->alt,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
