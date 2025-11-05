<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Purchase;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Vendor;
use App\Models\StockSummary;
use App\Models\Account;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();

        // Redirect super admin to their dashboard
        if ($user->is_super_admin) {
            return redirect()->route('super-admin.dashboard');
        }

        $tenantId = $user->tenant_id;        // If no tenant_id, create default data structure
        if (!$tenantId) {
            return Inertia::render('Dashboard', [
                'metrics' => [
                    'sales' => ['current_month' => 0, 'last_month' => 0, 'growth_percentage' => 0],
                    'purchases' => ['current_month' => 0],
                    'customers' => ['total' => 0, 'new_this_month' => 0],
                    'vendors' => ['total' => 0, 'total_due' => 0],
                    'products' => ['total' => 0, 'low_stock' => 0],
                    'financial' => ['cash_balance' => 0, 'revenue_this_month' => 0, 'total_stock_value' => 0]
                ],
                'charts' => [
                    'daily_sales' => [],
                    'monthly_sales' => [],
                    'top_products' => []
                ],
                'alerts' => ['low_stock_products' => []],
                'recent' => ['sales' => [], 'purchases' => []]
            ]);
        }

        // Get key metrics for the current month
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // Sales Metrics
        $currentMonthSales = Sale::where('tenant_id', $tenantId)
            ->whereBetween('sale_date', [$startOfMonth, $endOfMonth])
            ->sum('total');

        $lastMonthSales = Sale::where('tenant_id', $tenantId)
            ->whereBetween('sale_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total');

        $salesGrowth = $lastMonthSales > 0
            ? (($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100
            : 0;

        // Purchase Metrics
        $currentMonthPurchases = Purchase::where('tenant_id', $tenantId)
            ->whereBetween('purchase_date', [$startOfMonth, $endOfMonth])
            ->sum('total');

        // Customer Metrics
        $totalCustomers = Customer::where('tenant_id', $tenantId)->count();
        $newCustomersThisMonth = Customer::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();
        $totalCustomerDue = Customer::where('tenant_id', $tenantId)->sum('current_due');

        // Vendor Metrics
        $totalVendors = Vendor::where('tenant_id', $tenantId)->count();
        $totalVendorDue = Vendor::where('tenant_id', $tenantId)->sum('current_due');

        // Product & Stock Metrics
        $totalProducts = Product::where('tenant_id', $tenantId)->count();

        // Fixed: Using correct column name from migration
        $lowStockItems = StockSummary::where('tenant_id', $tenantId)
            ->whereHas('product', function ($q) {
                $q->where('stock_summary.total_qty', '<=', DB::raw('products.low_stock_alert'));
            })
            ->count();

        // Calculate total stock value
        $totalStockValue = StockSummary::where('tenant_id', $tenantId)
            ->sum('total_value');

        // Financial Metrics - Bank Balance
        $bankAccount = Account::getBankAccount($tenantId);
        $cashBalance = $bankAccount ? $bankAccount->current_balance : 0;

        // Revenue this month (from sales)
        $revenueThisMonth = $currentMonthSales;

        // Recent Sales (last 7 days with daily breakdown)
        $last7Days = collect(range(6, 0))->map(function ($daysAgo) use ($tenantId) {
            $date = Carbon::now()->subDays($daysAgo);
            $sales = Sale::where('tenant_id', $tenantId)
                ->whereDate('sale_date', $date)
                ->sum('total');

            return [
                'date' => $date->format('M j'),
                'sales' => (float) $sales,
                'day' => $date->format('D')
            ];
        });

        // Top Selling Products (current month)
        $topProducts = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.tenant_id', $tenantId)
            ->whereBetween('sales.sale_date', [$startOfMonth, $endOfMonth])
            ->select(
                'products.name',
                DB::raw('SUM(sale_items.quantity) as total_quantity'),
                DB::raw('SUM(sale_items.total) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'total_quantity' => (float) $item->total_quantity,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });

        // Low Stock Alerts - Fixed query
        $lowStockProducts = StockSummary::where('stock_summary.tenant_id', $tenantId)
            ->join('products', 'stock_summary.product_id', '=', 'products.id')
            ->where('stock_summary.total_qty', '<=', DB::raw('products.low_stock_alert'))
            ->select(
                'stock_summary.id',
                'stock_summary.product_id',
                'stock_summary.total_qty',
                'stock_summary.avg_purchase_price',
                'stock_summary.total_value',
                'products.name as product_name',
                'products.unit as product_unit',
                'products.low_stock_alert as product_low_stock_alert'
            )
            ->orderBy('stock_summary.total_qty')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'total_qty' => (float) $item->total_qty,
                    'avg_purchase_price' => (float) $item->avg_purchase_price,
                    'total_value' => (float) $item->total_value,
                    'product' => [
                        'id' => $item->product_id,
                        'name' => $item->product_name,
                        'unit' => $item->product_unit,
                        'low_stock_alert' => (int) $item->product_low_stock_alert,
                    ]
                ];
            });

        // Recent Sales (last 10)
        $recentSales = Sale::where('tenant_id', $tenantId)
            ->with(['customer'])
            ->orderBy('sale_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'invoice_number' => $sale->invoice_number,
                    'sale_date' => $sale->sale_date,
                    'customer_name' => $sale->customer ? $sale->customer->name : 'Walk-in Customer',
                    'total' => (float) $sale->total,
                    'paid' => (float) $sale->paid,
                    'due' => (float) $sale->due,
                    'status' => $sale->status,
                ];
            });

        // Recent Purchases (last 10)
        $recentPurchases = Purchase::where('tenant_id', $tenantId)
            ->with(['vendor'])
            ->orderBy('purchase_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($purchase) {
                return [
                    'id' => $purchase->id,
                    'invoice_number' => $purchase->invoice_number,
                    'purchase_date' => $purchase->purchase_date,
                    'vendor_name' => $purchase->vendor ? $purchase->vendor->name : 'Unknown',
                    'total' => (float) $purchase->total,
                    'paid' => (float) $purchase->paid,
                    'due' => (float) $purchase->due,
                    'status' => $purchase->status,
                ];
            });

        // Monthly Sales Comparison (last 6 months)
        $monthlySales = collect(range(5, 0))->map(function ($monthsAgo) use ($tenantId) {
            $date = Carbon::now()->subMonths($monthsAgo);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $sales = Sale::where('tenant_id', $tenantId)
                ->whereBetween('sale_date', [$startOfMonth, $endOfMonth])
                ->sum('total');

            return [
                'month' => $date->format('M Y'),
                'sales' => (float) $sales,
                'short_month' => $date->format('M')
            ];
        });

        return Inertia::render('Dashboard', [
            'metrics' => [
                'sales' => [
                    'current_month' => (float) $currentMonthSales,
                    'last_month' => (float) $lastMonthSales,
                    'growth_percentage' => round($salesGrowth, 1)
                ],
                'purchases' => [
                    'current_month' => (float) $currentMonthPurchases
                ],
                'customers' => [
                    'total' => $totalCustomers,
                    'new_this_month' => $newCustomersThisMonth,
                    'total_due' => (float) $totalCustomerDue
                ],
                'vendors' => [
                    'total' => $totalVendors,
                    'total_due' => (float) $totalVendorDue
                ],
                'products' => [
                    'total' => $totalProducts,
                    'low_stock' => $lowStockItems
                ],
                'financial' => [
                    'cash_balance' => (float) $cashBalance,
                    'revenue_this_month' => (float) $revenueThisMonth,
                    'total_stock_value' => (float) $totalStockValue
                ]
            ],
            'charts' => [
                'daily_sales' => $last7Days,
                'monthly_sales' => $monthlySales,
                'top_products' => $topProducts
            ],
            'alerts' => [
                'low_stock_products' => $lowStockProducts
            ],
            'recent' => [
                'sales' => $recentSales,
                'purchases' => $recentPurchases
            ]
        ]);
    }
}
