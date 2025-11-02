<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\BankTransactionController;
use App\Http\Controllers\FixedAssetController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Reports\ProductReportController;
use App\Http\Controllers\Reports\ReceiptPaymentController;
use App\Http\Controllers\Reports\IncomeExpenditureController;
use App\Http\Controllers\Reports\BalanceSheetController;
use App\Http\Controllers\Reports\BankReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect('/login');
})->name('home');

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('welcome');

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
    
    // Tenant Registration Routes
    Route::get('tenant-register', [\App\Http\Controllers\TenantRegistrationController::class, 'create'])->name('tenant.register');
    Route::post('tenant-register', [\App\Http\Controllers\TenantRegistrationController::class, 'store'])->name('tenant.register.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Product Management Routes
    Route::resource('products', ProductController::class);
    Route::resource('product-categories', ProductCategoryController::class)->names([
        'index' => 'product-categories.index',
        'create' => 'product-categories.create',
        'store' => 'product-categories.store',
        'show' => 'product-categories.show',
        'edit' => 'product-categories.edit',
        'update' => 'product-categories.update',
        'destroy' => 'product-categories.destroy',
    ]);

    // Stock Management Routes
    Route::resource('stock', StockController::class)->except(['edit', 'update', 'destroy']);
    Route::get('stock/history/{product}', [StockController::class, 'history'])->name('stock.history');
    Route::post('stock/bulk-adjustment', [StockController::class, 'bulkAdjustment'])->name('stock.bulk-adjustment');
    Route::get('stock/low-stock', [StockController::class, 'lowStock'])->name('stock.low-stock');

    // Purchase Management Routes
    Route::resource('purchases', PurchaseController::class);

    // Customer Management Routes
    Route::resource('customers', CustomerController::class);

    // Vendor Management Routes
    Route::resource('vendors', VendorController::class);
    Route::post('vendors/{vendor}/payment', [VendorController::class, 'payment'])->name('vendors.payment');

    // Sales Management Routes
    Route::resource('sales', SaleController::class);
    Route::get('sales/{sale}/print', [SaleController::class, 'print'])->name('sales.print');
    Route::post('sales/{sale}/payments', [SaleController::class, 'addPayment'])->name('sales.payments.add');

    // Accounting System Routes
    Route::resource('accounts', AccountController::class);
    Route::get('accounts/bank-transactions', [AccountController::class, 'bankTransactions'])->name('accounts.bank-transactions');

    // Bank Transactions Routes
    Route::resource('bank-transactions', BankTransactionController::class)->except(['edit', 'update']);

    // Expenses Routes (using bank transactions with category 'expense')
    Route::get('expenses', [BankTransactionController::class, 'expenses'])->name('expenses.index');
    Route::get('expenses/{bankTransaction}', [BankTransactionController::class, 'expenseShow'])->name('expenses.show');

    // Fixed Assets Routes
    Route::get('fixed-assets/depreciation-report', [FixedAssetController::class, 'depreciationReport'])->name('fixed-assets.depreciation-report');
    Route::resource('fixed-assets', FixedAssetController::class)->names([
        'index' => 'fixed-assets.index',
        'create' => 'fixed-assets.create',
        'store' => 'fixed-assets.store',
        'show' => 'fixed-assets.show',
        'edit' => 'fixed-assets.edit',
        'update' => 'fixed-assets.update',
        'destroy' => 'fixed-assets.destroy',
    ]);
    Route::post('fixed-assets/{fixedAsset}/update-depreciation', [FixedAssetController::class, 'updateDepreciation'])->name('fixed-assets.update-depreciation');
    Route::post('fixed-assets/{fixedAsset}/dispose', [FixedAssetController::class, 'dispose'])->name('fixed-assets.dispose');
    Route::post('fixed-assets/{fixedAsset}/sell', [FixedAssetController::class, 'sell'])->name('fixed-assets.sell');

    // Financial Reports Routes
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/profit-and-loss', [ReportController::class, 'profitAndLoss'])->name('reports.profit-and-loss');
    // Redirect old balance sheet route to new one
    Route::get('reports/balance-sheet', function() {
        return redirect('/reports/balance-sheet-report');
    })->name('reports.balance-sheet');
    Route::get('reports/cash-flow', [ReportController::class, 'cashFlow'])->name('reports.cash-flow');

    // New Report Routes
    Route::prefix('reports')->name('reports.')->group(function () {
        // Product Analysis Report
        Route::get('product-analysis', [ProductReportController::class, 'index'])->name('product-analysis');
        Route::post('product-analysis/export', [ProductReportController::class, 'export'])->name('product-analysis.export');
        Route::get('product-analysis/export', [ProductReportController::class, 'export'])->name('product-analysis.export.get');

        // Receipt & Payment Report
        Route::get('receipt-payment', [ReceiptPaymentController::class, 'index'])->name('receipt-payment');
        Route::get('receipt-payment/export', [ReceiptPaymentController::class, 'export'])->name('receipt-payment.export');

        // Income & Expenditure Report
        Route::get('income-expenditure', [IncomeExpenditureController::class, 'index'])->name('income-expenditure');
        Route::post('income-expenditure/export', [IncomeExpenditureController::class, 'export'])->name('income-expenditure.export');
        Route::get('income-expenditure/export', [IncomeExpenditureController::class, 'export'])->name('income-expenditure.export.get');

        // Balance Sheet Report
        Route::get('balance-sheet-report', [BalanceSheetController::class, 'index'])->name('balance-sheet-report');
        Route::post('balance-sheet-report/export', [BalanceSheetController::class, 'export'])->name('balance-sheet-report.export');
        Route::get('balance-sheet-report/export', [BalanceSheetController::class, 'export'])->name('balance-sheet-report.export.get');

        // Bank Report
        Route::get('bank-report', [BankReportController::class, 'index'])->name('bank-report');
        Route::post('bank-report/export', [BankReportController::class, 'export'])->name('bank-report.export');
        Route::post('bank-report/pdf', [BankReportController::class, 'downloadPdf'])->name('bank-report.pdf');
        Route::get('bank-report/pdf', [BankReportController::class, 'downloadPdf'])->name('bank-report.pdf.get');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/super-admin.php';
