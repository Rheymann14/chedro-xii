<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

test('responses carry browser security headers', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertHeader('Content-Security-Policy', "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'")
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeaderMissing('Strict-Transport-Security');
});

test('secure production responses enforce https', function () {
    $this->app['env'] = 'production';

    $this->get(secure_url('/'))
        ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
});

test('public pages are rate limited per visitor', function () {
    RateLimiter::increment(md5('public127.0.0.1'), amount: 180);

    $this->get(route('home'))->assertTooManyRequests();
});

test('signed-in staff are rate limited by account rather than shared ip', function () {
    RateLimiter::increment(md5('public127.0.0.1'), amount: 180);

    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertOk();
});

test('search has a stricter rate limit', function () {
    foreach (range(1, 30) as $attempt) {
        $this->get(route('search', ['q' => 'cav']))->assertOk();
    }

    $this->get(route('search', ['q' => 'cav']))->assertTooManyRequests();
});
