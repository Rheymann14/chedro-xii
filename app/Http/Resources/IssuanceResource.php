<?php

namespace App\Http\Resources;

use App\Models\Issuance;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Issuance
 */
class IssuanceResource extends JsonResource
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
            'reference_no' => $this->reference_no,
            'issued_on' => $this->issued_on->toDateString(),
            'type' => $this->type->name,
            'is_internal' => $this->isInternal(),
            'file_url' => route('issuances.file', $this),
            'file_extension' => $this->fileExtension(),
        ];
    }
}
