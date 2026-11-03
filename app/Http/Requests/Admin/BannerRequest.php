<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'alt' => ['nullable', 'string', 'max:255'],
            'link_url' => ['nullable', 'string', 'max:255', 'regex:~^(https?://|/)~i'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:65000'],
            'is_active' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'image' => [
                $this->route('banner') === null ? 'required' : 'nullable',
                File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(5 * 1024)->dimensions(Rule::dimensions()->minWidth(1200)->maxWidth(6000)),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'link_url.regex' => 'The link must be a full URL (https://…) or a site path starting with "/".',
            'image.dimensions' => 'The banner image must be at least 1200 pixels wide.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'alt' => 'alternative text',
            'link_url' => 'link',
        ];
    }
}
