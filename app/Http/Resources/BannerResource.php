<?php

namespace App\Http\Resources;

use App\Models\Banner;
use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Banner
 */
class BannerResource extends JsonResource
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
            'title' => $this->title,
            'image_url' => Media::url($this->image_path),
            'link_url' => $this->link_url,
            'alt' => $this->alt,
        ];
    }
}
