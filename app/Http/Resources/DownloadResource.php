<?php

namespace App\Http\Resources;

use App\Models\Download;
use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Download
 */
class DownloadResource extends JsonResource
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
            'description' => $this->description,
            'file_url' => Media::url($this->file_path),
            'file_size' => $this->file_size,
            'file_extension' => $this->fileExtension(),
        ];
    }
}
