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
use Illuminate\Support\Facades\DB;
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

        // Liabilities calculation
        $liabilities = $this->calculateLiabilitiesEquity($tenantId, $endDate);

        return Inertia::render('Reports/BalanceSheet', [
            'assets' => $assets,
            'liabilities' => $liabilities,
            'year' => $year,
            'month' => $month,
            'month_name' => $endDate->format('F'),
            'end_date' => $endDate->format('Y-m-d'),
        ]);
    }

    private function calculateAssets(int $tenantId, Carbon $endDate): array
    {
        // 1. Bank Balance - Get month-wise balance from bank transactions
        $bankBalance = $this->getBankBalance($tenantId, $endDate);

        // 2. Customer Due - Outstanding amounts from sales (more accurate)
        $customerDue = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('sale_date', '<=', $endDate->toDateString())
            ->sum('due') ?? 0;

        // 3. Fixed Assets - From bank transactions with category 'fixed_asset'
        $fixedAssets = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'fixed_asset')
            ->where('type', 'debit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        // 4. Stock Value - Using ProductReport accurate calculation logic (date-based)
        $stockValue = $this->calculateAccurateStockValue($tenantId, $endDate);

        // Calculate Total Assets
        $totalAssets = $bankBalance + $customerDue + $fixedAssets + $stockValue;

        return [
            'bank_balance' => (float)$bankBalance,
            'customer_due' => (float)$customerDue,
            'fixed_assets' => (float)$fixedAssets,
            'stock_value' => (float)$stockValue,
            'total' => (float)$totalAssets,
        ];
    }

    private function calculateLiabilitiesEquity(int $tenantId, Carbon $endDate): array
    {
        // ========== FUND & LIABILITIES ==========

        // 1. Fund = Total Fund In - Fund Out
        $fundIn = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'fund_in')
            ->where('type', 'credit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        $fundOut = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'fund_out')
            ->where('type', 'debit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        $netFund = $fundIn - $fundOut;

        // 2. Profit Category - From bank transactions
        $profitCategory = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'profit')
            ->where('type', 'credit')
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->sum('amount') ?? 0;

        // 3. Net Profit = Income - Expenditure (Cumulative from year start)
        $cumulativeStart = Carbon::create($endDate->year, 1, 1)->startOfMonth();
        $cumulativeIncome = $this->calculateCumulativeIncome($tenantId, $cumulativeStart, $endDate);
        $cumulativeExpenditure = $this->calculateCumulativeExpenditure($tenantId, $cumulativeStart, $endDate);
        $netProfit = $cumulativeIncome - $cumulativeExpenditure;

        // Total Fund & Liabilities
        $totalLiabilities = $netFund + $profitCategory + $netProfit;

        return [
            'fund' => (float)$netFund,
            'profit' => (float)$profitCategory,
            'net_profit' => (float)$netProfit,
            'total' => (float)$totalLiabilities,
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

    private function calculateCumulativeIncome(int $tenantId, Carbon $startDate, Carbon $endDate): float
    {
        // Use PRODUCT-LEVEL calculation from ProductReportController for accuracy
        $products = \App\Models\Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

        $totalSalesProfit = 0.0;

        foreach ($products as $product) {
            // Get purchase data for the period
            $purchaseData = \App\Models\PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                ->where('purchase_items.product_id', $product->id)
                ->where('purchases.tenant_id', $tenantId)
                ->whereBetween('purchases.purchase_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('
                    CAST(SUM(purchase_items.quantity) AS DECIMAL(15,6)) as total_purchase_qty,
                    CAST(SUM(purchase_items.total) AS DECIMAL(15,6)) as total_purchase_value
                ')
                ->first();

            // Get sale data for the period
            $saleData = \App\Models\SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $product->id)
                ->where('sales.tenant_id', $tenantId)
                ->whereBetween('sales.sale_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('
                    CAST(SUM(sale_items.quantity) AS DECIMAL(15,6)) as total_sale_qty,
                    CAST(SUM(sale_items.total) AS DECIMAL(15,6)) as sale_subtotal
                ')
                ->first();

            // Calculate proportional discount
            $productDiscount = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $product->id)
                ->where('sales.tenant_id', $tenantId)
                ->whereBetween('sales.sale_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('
                    CAST(SUM(
                        CASE
                            WHEN sales.subtotal > 0
                            THEN (sale_items.total / sales.subtotal) * sales.discount
                            ELSE 0
                        END
                    ) AS DECIMAL(15,6)) as product_discount
                ')
                ->value('product_discount') ?? 0;

            $purchaseQty = (float)($purchaseData->total_purchase_qty ?? 0);
            $saleQty = (float)($saleData->total_sale_qty ?? 0);
            $purchaseTotal = (float)($purchaseData->total_purchase_value ?? 0);
            $saleSubtotal = (float)($saleData->sale_subtotal ?? 0);
            $saleDiscount = (float)$productDiscount;
            $saleTotal = $saleSubtotal - $saleDiscount;

            // Skip if no sales
            if ($saleQty <= 0) {
                continue;
            }

            // Get stock information
            $stockSummary = $product->stockSummary;
            $currentStock = $stockSummary ? (float)$stockSummary->total_qty : 0;
            $avgPurchasePrice = $stockSummary ? (float)$stockSummary->avg_purchase_price : 0;

            // Calculate before stock
            $beforeStock = $currentStock - $purchaseQty + $saleQty;
            $beforeStock = max(0, $beforeStock);

            // Calculate before stock value
            $beforeStockValue = 0.0;
            $beforeStockPrice = 0.0;

            if ($beforeStock > 0) {
                $stockBeforePeriod = DB::table('stock_entries')
                    ->where('product_id', $product->id)
                    ->where('tenant_id', $tenantId)
                    ->where('entry_date', '<', $startDate->toDateString())
                    ->selectRaw('
                        CAST(SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) AS DECIMAL(15,6)) as total_in,
                        CAST(SUM(CASE WHEN quantity > 0 THEN quantity * purchase_price ELSE 0 END) AS DECIMAL(15,6)) as total_value
                    ')
                    ->first();

                $totalIn = (float)($stockBeforePeriod->total_in ?? 0);
                if ($totalIn > 0) {
                    $totalValue = (float)($stockBeforePeriod->total_value ?? 0);
                    $beforeStockPrice = $totalValue / $totalIn;
                    $beforeStockValue = $beforeStock * $beforeStockPrice;
                } else {
                    $beforeStockPrice = $avgPurchasePrice;
                    $beforeStockValue = $beforeStock * $beforeStockPrice;
                }
            }

            // Calculate ACCURATE cost of sales using weighted average (SAME AS ProductReportController)
            $totalAvailableQty = $beforeStock + $purchaseQty;
            $totalAvailableValue = $beforeStockValue + $purchaseTotal;

            $weightedAvgCost = $totalAvailableQty > 0 ? $totalAvailableValue / $totalAvailableQty : 0;
            $totalCostOfSales = $saleQty * $weightedAvgCost;
            $totalProfit = $saleTotal - $totalCostOfSales;

            $totalSalesProfit += $totalProfit;
        }

        // Other Income from bank transactions
        $otherIncome = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->whereNotIn('category', ['sale', 'customer_payment', 'profit', 'fund_in', 'fund_out', 'fixed_asset'])
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount') ?? 0;

        return $totalSalesProfit + $otherIncome;
    }

    private function calculateCumulativeExpenditure(int $tenantId, Carbon $startDate, Carbon $endDate): float
    {
        // All expenses except excluded categories
        $totalExpenditure = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->whereNotIn('category', ['profit', 'fund_in', 'fund_out', 'fixed_asset', 'purchase', 'vendor_payment'])
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount') ?? 0;

        return $totalExpenditure;
    }

    private function calculateAccurateStockValue(int $tenantId, Carbon $endDate): float
    {
        // Calculate stock value using ProductReport's accurate method
        // Formula: Available Stock Value = Before Stock Value + Purchases - Cost of Sales

        $yearStart = Carbon::create($endDate->year, 1, 1)->startOfMonth();

        $products = \App\Models\Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->with('stockSummary')
            ->get();

        $totalStockValue = 0.0;

        foreach ($products as $product) {
            $productId = $product->id;

            // Get current stock
            $stockSummary = $product->stockSummary;
            if (!$stockSummary) {
                continue;
            }

            $currentQty = (float)$stockSummary->total_qty;
            $avgPurchasePrice = (float)$stockSummary->avg_purchase_price;

            // Get period purchases (year start to end date) with high precision
            $periodPurchases = DB::table('purchase_items')
                ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                ->where('purchase_items.product_id', $productId)
                ->where('purchases.tenant_id', $tenantId)
                ->whereBetween('purchases.purchase_date', [$yearStart->toDateString(), $endDate->toDateString()])
                ->selectRaw('CAST(SUM(purchase_items.quantity) AS DECIMAL(15,6)) as purchase_qty, CAST(SUM(purchase_items.total) AS DECIMAL(15,6)) as purchase_value')
                ->first();

            $purchaseQty = (float)($periodPurchases->purchase_qty ?? 0);
            $purchaseValue = (float)($periodPurchases->purchase_value ?? 0);

            // Get period sales
            $periodSales = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $productId)
                ->where('sales.tenant_id', $tenantId)
                ->whereBetween('sales.sale_date', [$yearStart->toDateString(), $endDate->toDateString()])
                ->sum('sale_items.quantity');

            $saleQty = (float)($periodSales ?? 0);

            // Calculate before stock
            $beforeStockQty = $currentQty - $purchaseQty + $saleQty;
            $beforeStockQty = max(0, $beforeStockQty);

            // Calculate before stock value with high precision
            $beforeStockValue = 0.0;
            $beforeStockPrice = 0.0;

            if ($beforeStockQty > 0) {
                $stockBeforePeriod = DB::table('stock_entries')
                    ->where('product_id', $productId)
                    ->where('tenant_id', $tenantId)
                    ->where('entry_date', '<', $yearStart->toDateString())
                    ->selectRaw('
                        CAST(SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) AS DECIMAL(15,6)) as total_in,
                        CAST(SUM(CASE WHEN quantity > 0 THEN quantity * purchase_price ELSE 0 END) AS DECIMAL(15,6)) as total_value
                    ')
                    ->first();

                $totalIn = (float)($stockBeforePeriod->total_in ?? 0);
                if ($totalIn > 0) {
                    $totalValue = (float)($stockBeforePeriod->total_value ?? 0);
                    $beforeStockPrice = $totalValue / $totalIn;
                    $beforeStockValue = $beforeStockQty * $beforeStockPrice;
                } else {
                    // Fallback to stock summary avg if no stock entries found
                    $beforeStockPrice = $avgPurchasePrice;
                    $beforeStockValue = $beforeStockQty * $avgPurchasePrice;
                }
            }

            // Calculate weighted average cost with high precision
            $totalAvailableQty = $beforeStockQty + $purchaseQty;
            $totalAvailableValue = $beforeStockValue + $purchaseValue;
            $weightedAvgCost = $totalAvailableQty > 0 ? ($totalAvailableValue / $totalAvailableQty) : 0.0;

            // Calculate cost of sales
            $costOfSales = $saleQty * $weightedAvgCost;

            // Available Stock Value = Before Stock Value + Purchase Value - Cost of Sales
            $availableStockValue = $beforeStockValue + $purchaseValue - $costOfSales;

            $totalStockValue += $availableStockValue;
        }

        return $totalStockValue;
    }


    public function export(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        $endDate = Carbon::create($year, $month, 1)->endOfMonth();
        $tenantId = Auth::user()->tenant_id;

        // Get tenant information
        $tenant = \App\Models\Tenant::find($tenantId);

        // Get data
        $assets = $this->calculateAssets($tenantId, $endDate);
        $liabilities = $this->calculateLiabilitiesEquity($tenantId, $endDate);

        // Generate PDF
        $pdf = Pdf::loadView('reports.balance-sheet-pdf', [
            'assets' => $assets,
            'liabilities' => $liabilities,
            'month_name' => $endDate->format('F'),
            'year' => $year,
            'end_date' => $endDate->format('d M Y'),
            'tenant' => $tenant,
        ]);

        return $pdf->stream('balance-sheet-' . $endDate->format('Y-m') . '.pdf');
    }
}
