<?php

use App\Models\ContactMessage;

function validContactMessage(array $overrides = []): array
{
    return [
        'name' => 'Juan dela Cruz',
        'email' => 'juan@example.com',
        'subject' => 'CAV requirements',
        'message' => 'What are the requirements for CAV?',
        ...$overrides,
    ];
}

test('visitors can send a message', function () {
    $this->post(route('contact.store'), validContactMessage())
        ->assertRedirect(route('contact.show'))
        ->assertSessionHasNoErrors();

    $message = ContactMessage::query()->sole();

    expect($message->email)->toBe('juan@example.com')
        ->and($message->ip_address)->toBe('127.0.0.1')
        ->and($message->read_at)->toBeNull();
});

test('required fields are validated', function () {
    $this->post(route('contact.store'), [])
        ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);

    expect(ContactMessage::query()->count())->toBe(0);
});

test('submissions that fill the honeypot are rejected', function () {
    $this->post(route('contact.store'), validContactMessage(['website' => 'https://spam.example']))
        ->assertSessionHasErrors(['website' => 'Your message could not be sent.']);

    expect(ContactMessage::query()->count())->toBe(0);
});

test('submissions are rate limited', function () {
    foreach (range(1, 3) as $attempt) {
        $this->post(route('contact.store'), validContactMessage())->assertRedirect();
    }

    $this->post(route('contact.store'), validContactMessage())->assertTooManyRequests();

    expect(ContactMessage::query()->count())->toBe(3);
});
