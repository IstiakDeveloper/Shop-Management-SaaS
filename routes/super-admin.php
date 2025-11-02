<?php

use App\Http\Controllers\SuperAdmin\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| These routes are for the Super Administrator panel. All routes require
| authentication and super_admin middleware to access system-wide controls.
|
*/

Route::prefix('super-admin')->name('super-admin.')->middleware(['auth', 'super_admin'])->group(function () {

    // Dashboard - Main landing page for super admin
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Lightweight endpoints handled by DashboardController while other controllers are scaffolded
    Route::get('/tenants', [DashboardController::class, 'tenants'])->name('tenants.index');
    Route::get('/tenants/create', [DashboardController::class, 'createTenant'])->name('tenants.create');
    Route::post('/tenants', [DashboardController::class, 'storeTenant'])->name('tenants.store');
    Route::post('/tenants/{tenant}/subscription', [DashboardController::class, 'createSubscription'])->name('tenants.subscription.create');

    Route::get('/subscriptions', [DashboardController::class, 'subscriptions'])->name('subscriptions.index');
    Route::get('/invoices', [DashboardController::class, 'invoices'])->name('invoices.index');
    Route::get('/payments', [DashboardController::class, 'payments'])->name('payments.index');
    Route::get('/reports', [DashboardController::class, 'reports'])->name('reports.index');
});
