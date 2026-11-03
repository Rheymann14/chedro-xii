<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('public/contact');
    }

    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        $message = new ContactMessage($request->safe()->except('website'));
        $message->ip_address = $request->ip();
        $message->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Thank you! Your message has been sent.']);

        return to_route('contact.show');
    }
}
