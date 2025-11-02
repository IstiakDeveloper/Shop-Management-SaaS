<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\Account;
use App\Models\Customer;
use App\Models\Vendor;
use App\Models\StockSummary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class BalanceSheetController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $tenantId = Auth::user()->tenant_id;

        // Assets calculation
        $assets = $this->calculateAssets($tenantId, $endDate);

        // Liabilities & Equity calculation
        $liabilitiesEquity = $this->calculateLiabilitiesEquity($tenantId, $endDate);

        return Inertia::render('Reports/BalanceSheet', [
            'assets' => $assets,
            'liabilities_equity' => $liabilitiesEquity,
            'year' => $year,
            'month' => $month,
            'month_name' => $endDate->format('F'),
            'end_date' => $endDate->format('Y-m-d'),
        ]);
    }

    private function calculateAssets(int $tenantId, Carbon $endDate): array
    {
        // 1. Current Assets
        // Cash at Bank - Get from Account model
        $bankAccount = Account::where('tenant_id', $tenantId)
            ->where('type', 'bank')
            ->first();
        $cashAtBank = $bankAccount ? (float)$bankAccount->current_balance : 0;

        // 2. Stock Value - Current inventory value
        $stockValue = StockSummary::where('tenant_id', $tenantId)
            ->selectRaw('SUM(total_qty * avg_purchase_price) as total_value')
            ->value('total_value') ?? 0;

        // 3. Fixed Assets - Get from Account model
        $fixedAssets = Account::where('tenant_id', $tenantId)
            ->where('type', 'fixed_asset')
            ->get(['name', 'current_balance'])
            ->map(function ($asset) {
                return [
                    'name' => $asset->name,
                    'value' => (float)$asset->current_balance
                ];
            });

        $totalFixedAssets = $fixedAssets->sum('value');

        // 4. Customer Due - Outstanding amounts from customers (if any)
        $customerDue = Customer::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->sum('current_due') ?? 0;

        // Calculate totals
        $currentAssets = $cashAtBank + $stockValue + $customerDue;
        $totalAssets = $currentAssets + $totalFixedAssets;

        return [
            'current_assets' => [
                'cash_at_bank' => (float)$cashAtBank,
                'stock_value' => (float)$stockValue,
                'customer_due' => (float)$customerDue,
                'total' => (float)$currentAssets,
            ],
            'fixed_assets' => [
                'items' => $fixedAssets->toArray(),
                'total' => (float)$totalFixedAssets,
            ],
            'total_assets' => (float)$totalAssets,
        ];
    }

    private function calculateLiabilitiesEquity(int $tenantId, Carbon $endDate): array
    {
        // 1. Opening Capital - From opening transactions
        $openingCapital = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'opening')
            ->where('type', 'credit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        // 2. Calculate Net Profit/Loss for the period
        // Revenue (Sales)
        $totalSales = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'sale')
            ->where('type', 'credit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        // Expenses (Purchase + Vendor Payments + Expenses)
        $totalPurchases = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'purchase')
            ->where('type', 'debit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        $totalExpenses = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'expense')
            ->where('type', 'debit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        $netProfit = $totalSales - $totalPurchases - $totalExpenses;

        // 3. Accounts Payable - Get actual vendor due amounts
        $accountsPayable = Vendor::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->sum('current_due') ?? 0;

        // Total Equity
        $totalEquity = $openingCapital + $netProfit;
        $totalLiabilitiesEquity = $accountsPayable + $totalEquity;

        return [
            'liabilities' => [
                'accounts_payable' => (float)$accountsPayable,
                'total' => (float)$accountsPayable,
            ],
            'equity' => [
                'opening_capital' => (float)$openingCapital,
                'net_profit' => (float)$netProfit,
                'total' => (float)$totalEquity,
            ],
            'total_liabilities_equity' => (float)$totalLiabilitiesEquity,
            // Debug info
            'calculations' => [
                'total_sales' => (float)$totalSales,
                'total_purchases' => (float)$totalPurchases,
                'total_expenses' => (float)$totalExpenses,
                'accounts_payable_from_vendors' => (float)$accountsPayable,
            ]
        ];
    }

    private function getBankBalance(int $tenantId, Carbon $endDate): float
    {
        // Get the latest bank transaction balance at or before the end date
        $lastTransaction = BankTransaction::where('tenant_id', $tenantId)
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        return $lastTransaction ? (float)$lastTransaction->balance_after : 0;
    }

    private function calculateCapital(int $tenantId, Carbon $endDate): float
    {
        // Get all opening transactions (initial capital)
        $openingCapital = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'opening')
            ->where('type', 'credit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount');

        return (float)$openingCapital;
    }

    private function calculateAccountsPayable(int $tenantId, Carbon $endDate): float
    {
        // Calculate outstanding payables: Total Purchases - Vendor Payments
        $totalPurchases = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->where('category', 'purchase')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount');

        $totalVendorPayments = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->where('category', 'vendor_payment')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount');

        // Accounts Payable = Purchases not yet paid for
        $accountsPayable = $totalPurchases - $totalVendorPayments;

        return (float)max(0, $accountsPayable); // Ensure it's not negative
    }

    private function calculateRetainedEarnings(int $tenantId, Carbon $endDate): float
    {
        // Total Revenue (Sales)
        $totalRevenue = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->where('category', 'sale')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount');

        // Cost of Goods Sold (COGS) - Calculate from stock movements
        // For simplicity, we'll calculate COGS as: Total Purchases - Current Stock Value
        $totalPurchases = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->where('category', 'purchase')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount');

        $currentStockValue = StockSummary::where('tenant_id', $tenantId)
            ->selectRaw('SUM(total_qty * avg_purchase_price) as total_value')
            ->value('total_value') ?? 0;

        $cogs = $totalPurchases - $currentStockValue;

        // Gross Profit = Revenue - COGS
        $grossProfit = $totalRevenue - $cogs;

        // Operating Expenses (excluding purchases and vendor_payment - those are COGS related)
        $operatingExpenses = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->whereIn('category', ['expense']) // Only actual operating expenses
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount');

        // Net Profit = Gross Profit - Operating Expenses
        $netProfit = $grossProfit - $operatingExpenses;

        return (float)$netProfit;
    }

    public function export(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        $endDate = Carbon::create($year, $month, 1)->endOfMonth();
        $tenantId = Auth::user()->tenant_id;

        // Get data
        $assets = $this->calculateAssets($tenantId, $endDate);
        $liabilitiesEquity = $this->calculateLiabilitiesEquity($tenantId, $endDate);

        // Generate PDF
        $pdf = Pdf::loadView('reports.balance-sheet-pdf', [
            'assets' => $assets,
            'liabilities_equity' => $liabilitiesEquity,
            'month_name' => $endDate->format('F'),
            'year' => $year,
            'end_date' => $endDate->format('d M Y'),
            'company_name' => 'Your Company Name',
        ]);

        return $pdf->stream('balance-sheet-' . $endDate->format('Y-m') . '.pdf');
    }
}
