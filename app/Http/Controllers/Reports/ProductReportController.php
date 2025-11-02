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

        $products = $productsQuery->get()->map(function ($product) use ($startDate, $endDate) {
            // Get purchase data for the period
            $purchaseData = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                ->where('purchase_items.product_id', $product->id)
                ->where('purchases.tenant_id', $product->tenant_id)
                ->whereBetween('purchases.purchase_date', [$startDate, $endDate])
                ->selectRaw('
                    SUM(purchase_items.quantity) as total_purchase_qty,
                    AVG(purchase_items.unit_price) as avg_purchase_price,
                    SUM(purchase_items.total) as total_purchase_value
                ')
                ->first();

            // Get sale data for the period
            $saleData = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sale_items.product_id', $product->id)
                ->where('sales.tenant_id', $product->tenant_id)
                ->whereBetween('sales.sale_date', [$startDate, $endDate])
                ->selectRaw('
                    SUM(sale_items.quantity) as total_sale_qty,
                    AVG(sale_items.unit_price) as avg_sale_price,
                    SUM(sale_items.total) as total_sale_value
                ')
                ->first();

            // Get stock information
            $stockSummary = $product->stockSummary;
            $currentStock = $stockSummary ? $stockSummary->total_qty : 0;
            $avgPurchasePrice = $stockSummary ? $stockSummary->avg_purchase_price : 0;
            $stockValue = $currentStock * $avgPurchasePrice;

            // Calculate before stock (approximate)
            $beforeStock = $currentStock + ($saleData->total_sale_qty ?? 0) - ($purchaseData->total_purchase_qty ?? 0);

            // Calculate profit information
            $totalSaleValue = $saleData->total_sale_value ?? 0;
            $totalCostOfSales = ($saleData->total_sale_qty ?? 0) * $avgPurchasePrice;
            $totalProfit = $totalSaleValue - $totalCostOfSales;
            $profitPerUnit = $saleData->total_sale_qty > 0 ? $totalProfit / $saleData->total_sale_qty : 0;
            $profitMargin = $totalSaleValue > 0 ? ($totalProfit / $totalSaleValue) * 100 : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->code,
                'category' => $product->category ? $product->category->name : 'Uncategorized',

                // Before Stock Information
                'before_stock_qty' => max(0, $beforeStock),
                'before_stock_price' => $avgPurchasePrice,
                'before_stock_value' => max(0, $beforeStock) * $avgPurchasePrice,

                // Purchase Information
                'purchase_qty' => $purchaseData->total_purchase_qty ?? 0,
                'purchase_price' => $purchaseData->avg_purchase_price ?? 0,
                'purchase_total' => $purchaseData->total_purchase_value ?? 0,

                // Sale Information
                'sale_qty' => $saleData->total_sale_qty ?? 0,
                'sale_price' => $saleData->avg_sale_price ?? 0,
                'sale_subtotal' => $totalSaleValue,
                'sale_discount' => 0, // Could calculate from actual discounts
                'sale_total' => $totalSaleValue,

                // Profit Information
                'profit_per_unit' => $profitPerUnit,
                'profit_total' => $totalProfit,
                'profit_margin' => $profitMargin,

                // Available Stock Information
                'available_stock' => $currentStock,
                'available_stock_value' => $stockValue,
            ];
        });

        // Calculate totals
        $totals = [
            'total_purchase' => $products->sum('purchase_total'),
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
            ->with(['saleItems' => function ($query) use ($startDate, $endDate) {
                $query->whereHas('sale', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('sale_date', [$startDate->toDateString(), $endDate->toDateString()]);
                });
            }])
            ->with(['category', 'stockSummary'])
            ->get()
            ->map(function ($product) {
                $soldItems = $product->saleItems;
                $totalSoldQty = $soldItems->sum('quantity');
                $totalSaleValue = $soldItems->sum(function ($item) {
                    return $item->quantity * $item->unit_price;
                });

                $avgSalePrice = $totalSoldQty > 0 ? $totalSaleValue / $totalSoldQty : 0;
                $avgPurchasePrice = $product->avg_purchase_price ?? 0;
                $profitPerUnit = $avgSalePrice - $avgPurchasePrice;
                $totalProfit = $profitPerUnit * $totalSoldQty;
                $profitMargin = $avgSalePrice > 0 ? ($profitPerUnit / $avgSalePrice) * 100 : 0;
                $currentStock = $product->stockSummary ? $product->stockSummary->total_qty : 0;

                return [
                    'name' => $product->name,
                    'category' => $product->category ? $product->category->name : 'N/A',
                    'current_stock' => $currentStock,
                    'avg_purchase_price' => $avgPurchasePrice,
                    'total_sold' => $totalSoldQty,
                    'avg_sale_price' => $avgSalePrice,
                    'total_sale_amount' => $totalSaleValue,
                    'total_cost' => $totalSoldQty * $avgPurchasePrice,
                    'profit' => $totalProfit,
                    'margin_percentage' => $profitMargin,
                ];
            });

        $pdf = Pdf::loadView('reports.product-report-pdf', [
            'products' => $products,
            'start_date' => $startDate->format('d M Y'),
            'end_date' => $endDate->format('d M Y'),
            'company_name' => 'Shop Management System',
        ]);

        return $pdf->stream('product-analysis-' . $startDate->format('Y-m-d') . '-to-' . $endDate->format('Y-m-d') . '.pdf');
    }
}
