<?php

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Reloads the trusted proxy configuration as if TRUSTED_PROXIES were set.
 */
function trustProxies(string $setting): void
{
    $_SERVER['TRUSTED_PROXIES'] = $setting;

    config(['trustedproxy' => require config_path('trustedproxy.php')]);

    unset($_SERVER['TRUSTED_PROXIES']);
}

/**
 * Sends a contact message from the given connecting IP, claiming to forward
 * the visitor at 203.0.113.7.
 */
function contactFromProxy(string $connectingIp): ContactMessage
{
    test()->withServerVariables(['REMOTE_ADDR' => $connectingIp])
        ->withHeader('X-Forwarded-For', '203.0.113.7')
        ->post(route('contact.store'), [
            'name' => 'Juan dela Cruz',
            'email' => 'juan@example.com',
            'subject' => 'CAV requirements',
            'message' => 'What are the requirements for CAV?',
        ])
        ->assertRedirect();

    return ContactMessage::query()->sole();
}

test('requests through cloudflare record the visitor ip', function () {
    trustProxies('cloudflare');

    expect(contactFromProxy('162.158.10.20')->ip_address)->toBe('203.0.113.7');
});

test('forwarded ips from callers outside cloudflare are ignored', function () {
    trustProxies('cloudflare');

    expect(contactFromProxy('198.51.100.9')->ip_address)->toBe('198.51.100.9');
});

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
