<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DownloadCategoryController;
use App\Http\Controllers\Admin\DownloadController;
use App\Http\Controllers\Admin\IssuanceController;
use App\Http\Controllers\Admin\IssuanceTypeController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'can:manage-content'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::resource('posts', PostController::class)->except('show');
    Route::resource('issuances', IssuanceController::class)->except('show');
    Route::resource('issuance-types', IssuanceTypeController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('downloads', DownloadController::class)->except('show');
    Route::resource('download-categories', DownloadCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('banners', BannerController::class)->except('show');
    Route::resource('pages', PageController::class)->except('show');

    Route::middleware('can:administer')->group(function () {
        Route::resource('menu-items', MenuItemController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('menu-items/{menu_item}/move', [MenuItemController::class, 'move'])->name('menu-items.move');

        Route::resource('messages', ContactMessageController::class)->only(['index', 'show', 'destroy'])
            ->parameters(['messages' => 'contactMessage']);

        Route::resource('users', UserController::class)->except('show');

        Route::get('settings', [SiteSettingController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [SiteSettingController::class, 'update'])->name('settings.update');
    });
});
