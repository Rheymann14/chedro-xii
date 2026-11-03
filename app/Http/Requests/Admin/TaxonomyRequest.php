<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Validates issuance types and download categories, which share a shape.
 */
class TaxonomyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['slug' => Str::slug((string) $this->input('name'))]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $table = $this->routeIs('admin.issuance-types.*') ? 'issuance_types' : 'download_categories';
        $model = $this->route('issuance_type') ?? $this->route('download_category');

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', Rule::unique($table, 'slug')->ignore($model)],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:65000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'An entry with this name already exists.',
            'slug.required' => 'Please enter a name.',
        ];
    }
}
