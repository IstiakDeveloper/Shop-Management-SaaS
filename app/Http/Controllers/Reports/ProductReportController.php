<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SaleItem;
use App\Models\PurchaseItem;
use App\Models\StockSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ProductReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        $search = $request->input('search', '');

                $tenantId = Auth::user()?->tenant_id ?? 1;

        // Build the product query with stock and transaction data
        $productsQuery = Product::with(['category', 'stockSummary'])
            ->where('tenant_id', $tenantId)
            ->where('is_active', true);

        if ($search) {
            $productsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $products = $productsQuery->get()->map(function ($product) use ($startDate, $endDate, $search) {
            // Get purchase and sale data from their source tables
            // This reflects the CURRENT edited values (not stock_entries which has duplicates/adjustments)
            $purchaseData = DB::table('purchase_items')
                ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                ->where('purchase_items.product_id', $product->id)
                ->where('purchases.tenant_id', $product->tenant_id)
                ->whereBetween('purchases.purchase_date', [$startDate, $endDate])
                ->selectRaw('
                    SUM(purchase_items.quantity) as total_purchase,
                    SUM(purchase_items.total) as total_purchase_value
                ')
                ->first();

            $purchaseQty = (float)($purchaseData->total_purchase ?? 0);
            $purchaseTotal = (float)($purchaseData->total_purchase_value ?? 0);

            // Get sales from sale_items
            $saleData = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $product->id)
                ->where('sales.tenant_id', $product->tenant_id)
                ->whereBetween('sales.sale_date', [$startDate, $endDate])
                ->selectRaw('SUM(sale_items.quantity) as total_sale')
                ->first();

            $saleQty = (float)($saleData->total_sale ?? 0);

            // Get sale revenue data for the period (for profit calculation)
            $saleRevenueData = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $product->id)
                ->where('sales.tenant_id', $product->tenant_id)
                ->whereBetween('sales.sale_date', [$startDate, $endDate])
                ->selectRaw('
                    SUM(sale_items.total) as sale_subtotal
                ')
                ->first();

            // Calculate proportional discount for this product from all related sales
            $productDiscount = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $product->id)
                ->where('sales.tenant_id', $product->tenant_id)
                ->whereBetween('sales.sale_date', [$startDate, $endDate])
                ->selectRaw('
                    SUM(
                        CASE
                            WHEN sales.subtotal > 0
                            THEN (sale_items.total / sales.subtotal) * sales.discount
                            ELSE 0
                        END
                    ) as product_discount
                ')
                ->value('product_discount') ?? 0;

            // Get stock information
            $stockSummary = $product->stockSummary;
            $currentStock = $stockSummary ? (float)$stockSummary->total_qty : 0;
            $avgPurchasePrice = $stockSummary ? (float)$stockSummary->avg_purchase_price : 0;
            $stockValue = $currentStock * $avgPurchasePrice;

            // Calculate sale totals
            $saleSubtotal = (float)($saleRevenueData->sale_subtotal ?? 0);
            $saleDiscount = (float)$productDiscount;
            $saleTotal = $saleSubtotal - $saleDiscount;

            // Calculate weighted average prices for the period
            $avgPurchasePriceForPeriod = $purchaseQty > 0 ? $purchaseTotal / $purchaseQty : 0;
            $avgSalePriceForPeriod = $saleQty > 0 ? $saleSubtotal / $saleQty : 0;

            // Calculate before stock from stock_entries (INCLUDING adjustments)
            // Before Stock = Net sum of all entries before period
            // Adjustments are included because they correct purchase/sale edits
            $stockBeforePeriod = DB::table('stock_entries')
                ->where('product_id', $product->id)
                ->where('tenant_id', $product->tenant_id)
                ->where('entry_date', '<', $startDate)
                ->selectRaw('
                    SUM(quantity) as net_quantity,
                    SUM(CASE WHEN quantity > 0 THEN quantity * purchase_price ELSE 0 END) as total_in_value,
                    SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) as total_in_qty
                ')
                ->first();

            // Net quantity includes all entries (purchases + sales + adjustments)
            $beforeStock = (float)($stockBeforePeriod->net_quantity ?? 0);
            $beforeStock = max(0, $beforeStock); // Can't be negative

            // Debug: For specific product search, log the calculation
            if ($search && stripos($product->name, $search) !== false) {
                Log::info("Stock Calculation Debug for {$product->name} (Period: {$startDate} to {$endDate})", [
                    'before_stock_from_entries' => $beforeStock,
                    'current_stock_summary' => $currentStock,
                    'purchase_in_period' => $purchaseQty,
                    'sale_in_period' => $saleQty,
                    'calculated_available' => $beforeStock + $purchaseQty - $saleQty,
                ]);
            }

            // Calculate before stock value using weighted average of purchases
            $beforeStockValue = 0;
            $beforeStockPrice = 0;

            if ($beforeStock > 0) {
                $totalInQty = (float)($stockBeforePeriod->total_in_qty ?? 0);
                $totalInValue = (float)($stockBeforePeriod->total_in_value ?? 0);

                if ($totalInQty > 0) {
                    // Calculate weighted average purchase price from all purchases before period
                    $beforeStockPrice = $totalInValue / $totalInQty;
                    $beforeStockValue = $beforeStock * $beforeStockPrice;
                } else {
                    // Fallback: use current average purchase price if no historical data
                    $beforeStockPrice = $avgPurchasePrice;
                    $beforeStockValue = $beforeStock * $beforeStockPrice;
                }
            }

            // Calculate ACCURATE cost of sales using weighted average
            // Weighted Avg = (Before Stock Value + Period Purchase Value) / (Before Stock + Period Purchase)
            $totalAvailableQty = $beforeStock + $purchaseQty;
            $totalAvailableValue = $beforeStockValue + $purchaseTotal;

            $weightedAvgCost = $totalAvailableQty > 0 ? $totalAvailableValue / $totalAvailableQty : 0;

            // Cost of sales = quantity sold × weighted average cost
            $totalCostOfSales = $saleQty * $weightedAvgCost;
            $totalProfit = $saleTotal - $totalCostOfSales;
            $profitPerUnit = $saleQty > 0 ? $totalProfit / $saleQty : 0;
            $profitMargin = $saleTotal > 0 ? ($totalProfit / $saleTotal) * 100 : 0;

            // Calculate accurate available stock
            // Available Stock = Before Stock + Purchase - Sale
            $calculatedAvailableStock = $beforeStock + $purchaseQty - $saleQty;

            // Available Value = Before Stock Value + Purchase Value - Cost of Sales
            $availableStockValue = $beforeStockValue + $purchaseTotal - $totalCostOfSales;

            // Use calculated stock for consistency in report period
            // This ensures: Available = Before + Buy - Sale
            $finalAvailableStock = $calculatedAvailableStock;

            $result = [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->code,
                'category' => $product->category ? $product->category->name : 'Uncategorized',

                // Before Stock Information
                'before_stock_qty' => $beforeStock,
                'before_stock_price' => $beforeStockPrice,
                'before_stock_value' => $beforeStockValue,

                // Purchase Information
                'purchase_qty' => $purchaseQty,
                'purchase_price' => $avgPurchasePriceForPeriod,
                'purchase_total' => $purchaseTotal,

                // Sale Information
                'sale_qty' => $saleQty,
                'sale_price' => $avgSalePriceForPeriod,
                'sale_subtotal' => $saleSubtotal,
                'sale_discount' => $saleDiscount,
                'sale_total' => $saleTotal,

                // Profit Information
                'profit_per_unit' => $profitPerUnit,
                'profit_total' => $totalProfit,
                'profit_margin' => $profitMargin,

                // Available Stock Information
                'available_stock' => $finalAvailableStock,
                'available_stock_value' => $availableStockValue,
            ];

            // Add debug info in development mode
            if (config('app.debug')) {
                $result['_debug'] = [
                    'stock_summary_qty' => $currentStock,
                    'before_calc' => $beforeStock,
                    'purchase_calc' => $purchaseQty,
                    'sale_calc' => $saleQty,
                    'available_calc' => $finalAvailableStock,
                    'formula' => "{$beforeStock} + {$purchaseQty} - {$saleQty} = {$finalAvailableStock}",
                ];
            }

            return $result;
        });

        // Calculate totals
        $totals = [
            'total_purchase' => $products->sum('purchase_total'),
            'total_sale_subtotal' => $products->sum('sale_subtotal'),
            'total_sale_discount' => $products->sum('sale_discount'),
            'total_sale' => $products->sum('sale_total'),
            'total_profit' => $products->sum('profit_total'),
            'profit_margin' => $products->sum('sale_total') > 0 ?
                ($products->sum('profit_total') / $products->sum('sale_total')) * 100 : 0,
            'stock_value' => $products->sum('available_stock_value'),
        ];

        return Inertia::render('Reports/ProductReport', [
            'products' => $products->values(),
            'totals' => $totals,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search,
            ],
        ]);
    }

    public function export(Request $request)
    {
        // Implementation for Excel/PDF export
        $startDate = Carbon::parse($request->input('start_date', Carbon::now()->startOfMonth()->toDateString()));
        $endDate = Carbon::parse($request->input('end_date', Carbon::now()->endOfMonth()->toDateString()));

        // Generate PDF with actual data
        $tenantId = Auth::user()->tenant_id;

        // Get products data (same logic as index method)
        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->with(['category', 'stockSummary'])
            ->get()
            ->map(function ($product) use ($startDate, $endDate) {
                // Get purchase data from purchase_items (reflects current edited values)
                $purchaseData = DB::table('purchase_items')
                    ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                    ->where('purchase_items.product_id', $product->id)
                    ->where('purchases.tenant_id', $product->tenant_id)
                    ->whereBetween('purchases.purchase_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->selectRaw('
                        SUM(purchase_items.quantity) as total_purchase,
                        SUM(purchase_items.total) as total_purchase_value
                    ')
                    ->first();

                $purchaseQty = (float)($purchaseData->total_purchase ?? 0);
                $purchaseTotal = (float)($purchaseData->total_purchase_value ?? 0);

                // Get sales from sale_items
                $saleQtyData = DB::table('sale_items')
                    ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                    ->where('sale_items.product_id', $product->id)
                    ->where('sales.tenant_id', $product->tenant_id)
                    ->whereBetween('sales.sale_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->selectRaw('SUM(sale_items.quantity) as total_sale')
                    ->first();

                $totalSoldQty = (float)($saleQtyData->total_sale ?? 0);

                // Get sale revenue data for profit calculation
                $saleData = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                    ->where('sale_items.product_id', $product->id)
                    ->where('sales.tenant_id', $product->tenant_id)
                    ->whereBetween('sales.sale_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->selectRaw('
                        SUM(sale_items.total) as sale_subtotal
                    ')
                    ->first();

                // Calculate proportional discount
                $productDiscount = DB::table('sale_items')
                    ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                    ->where('sale_items.product_id', $product->id)
                    ->where('sales.tenant_id', $product->tenant_id)
                    ->whereBetween('sales.sale_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->selectRaw('
                        SUM(
                            CASE
                                WHEN sales.subtotal > 0
                                THEN (sale_items.total / sales.subtotal) * sales.discount
                                ELSE 0
                            END
                        ) as product_discount
                    ')
                    ->value('product_discount') ?? 0;

                $saleSubtotal = (float)($saleData->sale_subtotal ?? 0);
                $saleDiscount = (float)$productDiscount;
                $totalSaleValue = $saleSubtotal - $saleDiscount;
                $avgSalePrice = $totalSoldQty > 0 ? $saleSubtotal / $totalSoldQty : 0;

                // Get stock information
                $stockSummary = $product->stockSummary;
                $currentStock = $stockSummary ? (float)$stockSummary->total_qty : 0;
                $avgPurchasePrice = $stockSummary ? (float)$stockSummary->avg_purchase_price : 0;

                // Calculate before stock INCLUDING adjustments (for purchase edit corrections)
                $stockBeforePeriod = DB::table('stock_entries')
                    ->where('product_id', $product->id)
                    ->where('tenant_id', $product->tenant_id)
                    ->where('entry_date', '<', $startDate->toDateString())
                    ->selectRaw('
                        SUM(quantity) as net_quantity,
                        SUM(CASE WHEN quantity > 0 THEN quantity * purchase_price ELSE 0 END) as total_in_value,
                        SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) as total_in_qty
                    ')
                    ->first();

                $beforeStock = (float)($stockBeforePeriod->net_quantity ?? 0);
                $beforeStock = max(0, $beforeStock);

                // Calculate before stock value
                $beforeStockValue = 0;
                $beforeStockPrice = 0;

                if ($beforeStock > 0) {
                    $totalInQty = (float)($stockBeforePeriod->total_in_qty ?? 0);
                    $totalInValue = (float)($stockBeforePeriod->total_in_value ?? 0);

                    if ($totalInQty > 0) {
                        $beforeStockPrice = $totalInValue / $totalInQty;
                        $beforeStockValue = $beforeStock * $beforeStockPrice;
                    } else {
                        $beforeStockValue = $beforeStock * $avgPurchasePrice;
                    }
                }

                // Calculate weighted average cost for accurate profit
                $totalAvailableQty = $beforeStock + $purchaseQty;
                $totalAvailableValue = $beforeStockValue + $purchaseTotal;
                $weightedAvgCost = $totalAvailableQty > 0 ? $totalAvailableValue / $totalAvailableQty : 0;

                // Calculate profit using weighted average cost
                $totalCost = $totalSoldQty * $weightedAvgCost;
                $totalProfit = $totalSaleValue - $totalCost;
                $profitMargin = $totalSaleValue > 0 ? ($totalProfit / $totalSaleValue) * 100 : 0;

                // Calculate accurate available stock value
                $availableStockValue = $beforeStockValue + $purchaseTotal - $totalCost;

                // Calculate accurate available stock: Before + Purchase - Sale
                $calculatedAvailableStock = $beforeStock + $purchaseQty - $totalSoldQty;

                return [
                    'name' => $product->name,
                    'category' => $product->category ? $product->category->name : 'N/A',
                    'current_stock' => $calculatedAvailableStock,
                    'avg_purchase_price' => $avgPurchasePrice,
                    'stock_value' => $availableStockValue,
                    'total_sold' => $totalSoldQty,
                    'avg_sale_price' => $avgSalePrice,
                    'sale_subtotal' => $saleSubtotal,
                    'sale_discount' => $saleDiscount,
                    'total_sale_amount' => $totalSaleValue,
                    'total_cost' => $totalCost,
                    'profit' => $totalProfit,
                    'margin_percentage' => $profitMargin,
                ];
            });

        // Get tenant information
        $tenant = \App\Models\Tenant::find($tenantId);

        $pdf = Pdf::loadView('reports.product-report-pdf', [
            'products' => $products,
            'start_date' => $startDate->format('d M Y'),
            'end_date' => $endDate->format('d M Y'),
            'tenant' => $tenant,
        ]);

        return $pdf->stream('product-analysis-' . $startDate->format('Y-m-d') . '-to-' . $endDate->format('Y-m-d') . '.pdf');
    }
}
