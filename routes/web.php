<?php

use App\Enums\PostType;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\HeiController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\HubController;
use App\Http\Controllers\IssuanceController;
use App\Http\Controllers\IssuanceFileController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('announcements', [PostController::class, 'index'])->defaults('type', PostType::Announcement->value)->name('announcements.index');
Route::get('careers', [PostController::class, 'index'])->defaults('type', PostType::Career->value)->name('careers.index');
Route::get('awards', [PostController::class, 'index'])->defaults('type', PostType::Award->value)->name('awards.index');
Route::get('posts/{post:slug}', [PostController::class, 'show'])->name('posts.show');

Route::get('issuances', [IssuanceController::class, 'index'])->name('issuances.index');
Route::get('issuances/{issuance}/file', IssuanceFileController::class)->name('issuances.file');

Route::get('downloads', [DownloadController::class, 'index'])->name('downloads.index');

Route::get('heis', [HeiController::class, 'index'])->name('heis.index');
Route::get('heis/export/{format}', [HeiController::class, 'export'])
    ->whereIn('format', ['pdf', 'xlsx'])
    ->middleware('throttle:exports')
    ->name('heis.export');

Route::get('{hub}', HubController::class)
    ->whereIn('hub', ['about', 'online-services', 'hemis', 'resources'])
    ->name('hubs.show');

Route::inertia('online-services/cav-application', 'public/cav-application')->name('cav-application');
Route::inertia('statistics', 'public/statistics')->name('statistics');

Route::get('pages/{page:slug}', [PageController::class, 'show'])->name('pages.show');

Route::get('contact', [ContactController::class, 'show'])->name('contact.show');
Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:contact')->name('contact.store');

Route::get('calendar', CalendarController::class)->middleware('throttle:60,1')->name('calendar');
Route::get('search', SearchController::class)->name('search');
Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
