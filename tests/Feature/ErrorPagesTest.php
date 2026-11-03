<?php

use Illuminate\Support\Facades\Route;

test('missing pages render the branded not found page', function () {
    $this->get('/this-page-does-not-exist')
        ->assertNotFound()
        ->assertSee('Page not found');
});

test('server errors render the branded error page without leaking the exception', function () {
    config(['app.debug' => false]);

    Route::get('/_test/server-error', fn () => throw new RuntimeException('Secret internal detail'));

    $this->get('/_test/server-error')
        ->assertInternalServerError()
        ->assertSee('Something went wrong')
        ->assertDontSee('Secret internal detail');
});
