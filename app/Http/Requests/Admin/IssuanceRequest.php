<?php

namespace App\Http\Requests\Admin;

use App\Enums\IssuanceVisibility;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class IssuanceRequest extends FormRequest
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
            'issuance_type_id' => ['required', 'integer', Rule::exists('issuance_types', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'issued_on' => ['required', 'date'],
            'visibility' => ['required', Rule::enum(IssuanceVisibility::class)],
            'file' => [
                $this->route('issuance') === null ? 'required' : 'nullable',
                File::types(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'])->max(20 * 1024),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'issuance_type_id' => 'type',
            'issued_on' => 'date issued',
        ];
    }
}
