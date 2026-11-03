<?php

use App\Models\Post;

test('the calendar groups published posts of the month by day', function () {
    $this->travelTo('2026-11-20 12:00:00');

    $first = Post::factory()->create(['published_at' => '2026-11-03 09:00:00', 'title' => 'Memo on enrollment']);
    $second = Post::factory()->create(['published_at' => '2026-11-03 15:00:00']);
    Post::factory()->create(['published_at' => '2026-10-31 09:00:00']);
    Post::factory()->draft()->create();
    Post::factory()->create(['published_at' => '2026-11-25 09:00:00']);

    $this->getJson(route('calendar', ['month' => '2026-11']))
        ->assertOk()
        ->assertJsonPath('month', '2026-11')
        ->assertJsonCount(1, 'days')
        ->assertJsonCount(2, 'days.2026-11-03')
        ->assertJsonPath('days.2026-11-03.0.id', $first->id)
        ->assertJsonPath('days.2026-11-03.0.title', 'Memo on enrollment')
        ->assertJsonPath('days.2026-11-03.1.id', $second->id);
});

test('the month must be a valid year and month', function () {
    $this->getJson(route('calendar', ['month' => 'November']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('month');
});
