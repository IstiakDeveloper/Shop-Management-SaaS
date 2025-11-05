<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class IncomeExpenditureController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $tenantId = Auth::user()->tenant_id;

        // Calculate for selected month
        $monthStart = Carbon::create($year, $month, 1)->startOfMonth();
        $monthEnd = Carbon::create($year, $month, 1)->endOfMonth();

        $monthlyIncome = $this->calculateIncome($tenantId, $monthStart, $monthEnd);
        $monthlyExpenditure = $this->calculateExpenditure($tenantId, $monthStart, $monthEnd);
        $monthlyNetProfit = $monthlyIncome['total'] - $monthlyExpenditure['total'];

        // Calculate cumulative (from start of year to end of selected month)
        $cumulativeStart = Carbon::create($year, 1, 1)->startOfMonth();
        $cumulativeEnd = $monthEnd;

        $cumulativeIncome = $this->calculateIncome($tenantId, $cumulativeStart, $cumulativeEnd);
        $cumulativeExpenditure = $this->calculateExpenditure($tenantId, $cumulativeStart, $cumulativeEnd);
        $cumulativeNetProfit = $cumulativeIncome['total'] - $cumulativeExpenditure['total'];

        return Inertia::render('Reports/IncomeExpenditure', [
            'monthly' => [
                'income' => $monthlyIncome,
                'expenditure' => $monthlyExpenditure,
                'net_profit' => $monthlyNetProfit,
            ],
            'cumulative' => [
                'income' => $cumulativeIncome,
                'expenditure' => $cumulativeExpenditure,
                'net_profit' => $cumulativeNetProfit,
            ],
            'selected_month' => (int)$month,
            'selected_year' => (int)$year,
        ]);
    }

    private function calculateIncome(int $tenantId, Carbon $startDate, Carbon $endDate): array
    {
        $formattedIncome = [];

        // 1. SALES PROFIT - Calculate using PRODUCT-LEVEL logic (SAME AS Balance Sheet)
        $salesProfit = $this->calculateProductLevelProfit($tenantId, $startDate, $endDate);

        // 2. PROFIT CATEGORY - From bank transactions (same as Balance Sheet)
        $profitCategory = BankTransaction::where('tenant_id', $tenantId)
            ->where('category', 'profit')
            ->where('type', 'credit')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount') ?? 0;

        // Combine Sales Profit + Profit Category into one "Profit" entry
        $totalProfit = $salesProfit + $profitCategory;

        if ($totalProfit > 0) {
            $formattedIncome['profit'] = [
                'name' => 'Profit',
                'amount' => (float)$totalProfit
            ];
        }

        // 3. OTHER INCOME - Break down by category from bank transactions
        $otherIncomeCategories = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->whereNotIn('category', ['sale', 'customer_payment', 'profit', 'fund_in', 'fund_out', 'fixed_asset'])
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->select('category', DB::raw('SUM(amount) as total'), DB::raw('MAX(description) as description'))
            ->groupBy('category')
            ->get();

        foreach ($otherIncomeCategories as $category) {
            $categoryKey = 'income_' . $category->category;
            $categoryName = $category->description ?: ucwords(str_replace('_', ' ', $category->category));

            $formattedIncome[$categoryKey] = [
                'name' => $categoryName . ' (Others Income)',
                'amount' => (float)$category->total
            ];
        }

        $totalIncome = $totalProfit + $otherIncomeCategories->sum('total');

        return [
            'categories' => $formattedIncome,
            'total' => $totalIncome,
        ];
    }

    private function calculateExpenditure(int $tenantId, Carbon $startDate, Carbon $endDate): array
    {
        $formattedExpenditure = [];

        // Get all expense categories from bank transactions - break down by category
        $expenseCategories = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->whereNotIn('category', ['profit', 'fund_in', 'fund_out', 'fixed_asset', 'purchase', 'vendor_payment'])
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->select('category', DB::raw('SUM(amount) as total'), DB::raw('MAX(description) as description'))
            ->groupBy('category')
            ->get();

        foreach ($expenseCategories as $category) {
            $categoryKey = 'expense_' . $category->category;
            $categoryName = $category->description ?: ucwords(str_replace('_', ' ', $category->category));

            $formattedExpenditure[$categoryKey] = [
                'name' => $categoryName,
                'amount' => (float)$category->total
            ];
        }

        $totalExpenditure = $expenseCategories->sum('total');

        return [
            'categories' => $formattedExpenditure,
            'total' => $totalExpenditure,
        ];
    }

    private function calculateProductLevelProfit(int $tenantId, Carbon $startDate, Carbon $endDate): float
    {
        // Use PRODUCT-LEVEL calculation from Balance Sheet (EXACT SAME LOGIC)
        $products = \App\Models\Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

        $totalSalesProfit = 0.0;

        foreach ($products as $product) {
            $productId = $product->id;

            // Get purchase data for the period
            $purchaseData = \App\Models\PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                ->where('purchase_items.product_id', $productId)
                ->where('purchases.tenant_id', $tenantId)
                ->whereBetween('purchases.purchase_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('
                    CAST(SUM(purchase_items.quantity) AS DECIMAL(15,6)) as total_purchase_qty,
                    CAST(SUM(purchase_items.total) AS DECIMAL(15,6)) as total_purchase_value
                ')
                ->first();

            // Get sale data for the period
            $saleData = \App\Models\SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $productId)
                ->where('sales.tenant_id', $tenantId)
                ->whereBetween('sales.sale_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('
                    CAST(SUM(sale_items.quantity) AS DECIMAL(15,6)) as total_sale_qty,
                    CAST(SUM(sale_items.total) AS DECIMAL(15,6)) as sale_subtotal
                ')
                ->first();

            // Calculate proportional discount (IMPORTANT FOR ACCURACY!)
            $productDiscount = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $productId)
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
                    ->where('product_id', $productId)
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

            // Calculate ACCURATE cost of sales using weighted average (SAME AS ProductReportController & Balance Sheet)
            $totalAvailableQty = $beforeStock + $purchaseQty;
            $totalAvailableValue = $beforeStockValue + $purchaseTotal;

            $weightedAvgCost = $totalAvailableQty > 0 ? $totalAvailableValue / $totalAvailableQty : 0;
            $totalCostOfSales = $saleQty * $weightedAvgCost;
            $totalProfit = $saleTotal - $totalCostOfSales;

            $totalSalesProfit += $totalProfit;
        }

        return $totalSalesProfit;
    }

    public function export(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        // Monthly period
        $monthStart = Carbon::create($year, $month, 1)->startOfMonth();
        $monthEnd = Carbon::create($year, $month, 1)->endOfMonth();

        // Cumulative period (year start to end of selected month)
        $cumulativeStart = Carbon::create($year, 1, 1);
        $cumulativeEnd = $monthEnd;

        $tenantId = Auth::user()->tenant_id;

        // Get tenant information
        $tenant = \App\Models\Tenant::find($tenantId);

        // Get monthly data
        $monthlyIncome = $this->calculateIncome($tenantId, $monthStart, $monthEnd);
        $monthlyExpenditure = $this->calculateExpenditure($tenantId, $monthStart, $monthEnd);
        $monthlyNetProfit = $monthlyIncome['total'] - $monthlyExpenditure['total'];

        // Get cumulative data
        $cumulativeIncome = $this->calculateIncome($tenantId, $cumulativeStart, $cumulativeEnd);
        $cumulativeExpenditure = $this->calculateExpenditure($tenantId, $cumulativeStart, $cumulativeEnd);
        $cumulativeNetProfit = $cumulativeIncome['total'] - $cumulativeExpenditure['total'];

        $monthName = $monthStart->format('F');

        // Generate PDF
        $pdf = Pdf::loadView('reports.income-expenditure-pdf', [
            'monthly' => [
                'income' => $monthlyIncome,
                'expenditure' => $monthlyExpenditure,
                'net_profit' => $monthlyNetProfit,
            ],
            'cumulative' => [
                'income' => $cumulativeIncome,
                'expenditure' => $cumulativeExpenditure,
                'net_profit' => $cumulativeNetProfit,
            ],
            'month' => $monthName,
            'year' => $year,
            'tenant' => $tenant,
        ]);

        return $pdf->stream('income-expenditure-' . $monthName . '-' . $year . '.pdf');
    }
}
