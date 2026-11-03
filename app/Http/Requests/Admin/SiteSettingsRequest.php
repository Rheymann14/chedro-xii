<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SiteSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('administer') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'office_name' => ['required', 'string', 'max:120'],
            'office_address' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:100'],
            'facebook_url' => ['nullable', 'url:https', 'max:255'],
            'map_url' => ['nullable', 'url:https', 'max:500'],
            'director_name' => ['required', 'string', 'max:120'],
            'director_position' => ['required', 'string', 'max:120'],
            'office_hours' => ['required', 'string', 'max:120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'facebook_url' => 'Facebook page link',
            'map_url' => 'map link',
        ];
    }
}
