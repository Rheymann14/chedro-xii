<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['unread'])],
        ]);

        $messages = ContactMessage::query()
            ->when(($filters['status'] ?? null) === 'unread', fn ($query) => $query->unread())
            ->latest()
            ->paginate(20, ['id', 'name', 'email', 'subject', 'read_at', 'created_at'])
            ->withQueryString();

        return Inertia::render('admin/messages/index', [
            'messages' => JsonResource::collection($messages->through(fn (ContactMessage $message): array => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'subject' => $message->subject,
                'is_read' => $message->read_at !== null,
                'created_at' => $message->created_at?->toIso8601String(),
            ])),
            'filters' => ['status' => $filters['status'] ?? ''],
            'unreadCount' => ContactMessage::query()->unread()->count(),
        ]);
    }

    public function show(ContactMessage $contactMessage): Response
    {
        if ($contactMessage->read_at === null) {
            $contactMessage->forceFill(['read_at' => now()])->save();
        }

        return Inertia::render('admin/messages/show', [
            'message' => [
                'id' => $contactMessage->id,
                'name' => $contactMessage->name,
                'email' => $contactMessage->email,
                'phone' => $contactMessage->phone,
                'subject' => $contactMessage->subject,
                'message' => $contactMessage->message,
                'created_at' => $contactMessage->created_at?->toIso8601String(),
            ],
        ]);
    }

    public function destroy(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Message deleted.']);

        return to_route('admin.messages.index');
    }
}
