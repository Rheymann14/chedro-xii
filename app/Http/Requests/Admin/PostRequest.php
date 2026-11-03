<?php

namespace App\Http\Requests\Admin;

use App\Enums\PostType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class PostRequest extends FormRequest
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
            'type' => ['required', Rule::enum(PostType::class)],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string', 'max:200000'],
            'position' => ['nullable', 'string', 'max:255'],
            'published_at' => ['nullable', 'date'],
            'closing_at' => ['nullable', 'date', 'after_or_equal:published_at'],
            'youtube_url' => ['nullable', 'url:https', 'max:255', 'regex:~^https://(www\.|m\.)?(youtube\.com|youtu\.be)/~i'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => [File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(5 * 1024)->dimensions(Rule::dimensions()->maxWidth(6000)->maxHeight(6000))],
            'image_order' => ['nullable', 'array'],
            'image_order.*' => ['integer'],
            'removed_images' => ['nullable', 'array'],
            'removed_images.*' => ['integer'],
            'video' => ['nullable', File::types(['mp4', 'webm'])->max(50 * 1024)],
            'remove_video' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'youtube_url.regex' => 'Please enter a YouTube link (youtube.com or youtu.be).',
            'images.*.max' => 'Each image must be 5 MB or smaller.',
            'video.max' => 'The video must be 50 MB or smaller. Upload longer videos to YouTube and paste the link instead.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'published_at' => 'publish date',
            'closing_at' => 'closing date',
            'youtube_url' => 'YouTube link',
            'images.*' => 'image',
        ];
    }
}
