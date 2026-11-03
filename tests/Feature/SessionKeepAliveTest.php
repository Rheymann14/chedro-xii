<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('signed in users can keep their session alive', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('session.keep-alive'))
        ->assertNoContent();
});

test('guests can not keep a session alive', function () {
    $this->get(route('session.keep-alive'))->assertRedirect(route('login'));
});

test('the idle timeout is shared with the frontend', function () {
    config(['session.lifetime' => 30]);

    $this->actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('auth.idleTimeoutMinutes', 30));
});
