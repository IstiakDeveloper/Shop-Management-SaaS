<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TenantProfileController;
use App\Http\Controllers\Settings\TenantUserController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/tenant-profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Tenant Profile Routes - Admin only
    Route::middleware(['role:admin'])->group(function () {
        Route::get('settings/tenant-profile', [TenantProfileController::class, 'edit'])->name('tenant-profile.edit');
        Route::patch('settings/tenant-profile', [TenantProfileController::class, 'update'])->name('tenant-profile.update');
        Route::post('settings/tenant-profile', [TenantProfileController::class, 'update'])->name('tenant-profile.update.post');
        Route::delete('settings/tenant-profile/logo', [TenantProfileController::class, 'deleteLogo'])->name('tenant-profile.logo.delete');
        Route::get('settings/tenant-profile/statistics', [TenantProfileController::class, 'statistics'])->name('tenant-profile.statistics');

        // Tenant User Management Routes
        Route::get('settings/tenant-profile/users', [TenantUserController::class, 'index'])->name('tenant-users.index');
        Route::post('settings/tenant-profile/users', [TenantUserController::class, 'store'])->name('tenant-users.store');
        Route::put('settings/tenant-profile/users/{user}', [TenantUserController::class, 'update'])->name('tenant-users.update');
        Route::post('settings/tenant-profile/users/{user}/reset-password', [TenantUserController::class, 'resetPassword'])->name('tenant-users.reset-password');
        Route::post('settings/tenant-profile/users/{user}/toggle-status', [TenantUserController::class, 'toggleStatus'])->name('tenant-users.toggle-status');
        Route::delete('settings/tenant-profile/users/{user}', [TenantUserController::class, 'destroy'])->name('tenant-users.destroy');
    });

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
