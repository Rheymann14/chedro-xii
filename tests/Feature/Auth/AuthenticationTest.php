<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('deactivated users can not authenticate', function () {
    $user = User::factory()->inactive()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('users deactivated during a session are signed out', function () {
    $user = User::factory()->inactive()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

test('users signed in on another device can not authenticate again', function () {
    config(['session.driver' => 'database']);
    $user = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'other-device-session',
        'user_id' => $user->id,
        'payload' => '',
        'last_activity' => now()->getTimestamp(),
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('users whose other session has expired can authenticate', function () {
    config(['session.driver' => 'database']);
    $user = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'expired-session',
        'user_id' => $user->id,
        'payload' => '',
        'last_activity' => now()->subMinutes(config('session.lifetime') + 1)->getTimestamp(),
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});

test('login attempts are rate limited per ip across different emails', function () {
    RateLimiter::increment(md5('login'.'ip|127.0.0.1'), amount: 20);

    $this->post(route('login.store'), [
        'email' => 'someone-else@example.com',
        'password' => 'wrong-password',
    ])->assertTooManyRequests();
});
