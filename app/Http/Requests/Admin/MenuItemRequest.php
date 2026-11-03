<?php

namespace App\Http\Requests\Admin;

use App\Enums\MenuLocation;
use App\Models\MenuItem;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MenuItemRequest extends FormRequest
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
        /** @var MenuItem|null $item */
        $item = $this->route('menu_item');

        return [
            'menu' => ['required', Rule::enum(MenuLocation::class)],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('menu_items', 'id')->whereNull('parent_id')->where('menu', $this->input('menu')),
                Rule::notIn(array_filter([$item?->id])),
            ],
            'label' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:255', 'regex:~^(https?://|/|mailto:)~i'],
            'description' => ['nullable', 'string', 'max:300'],
            'opens_in_new_tab' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'url.regex' => 'The link must be a full URL (https://…), a site path starting with "/", or a mailto: address.',
            'parent_id.exists' => 'The parent must be a top-level item in the same menu.',
        ];
    }
}
