<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockEntry;
use App\Models\StockSummary;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = StockSummary::with(['product.category'])
            ->whereHas('product', function ($q) {
                $q->where('tenant_id', Auth::user()->tenant_id);
            })
            ->selectRaw('*, (total_qty * avg_purchase_price) as calculated_total_value');

        // Search functionality
        if ($request->filled('search')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // Stock status filter
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'out_of_stock') {
                $query->where('total_qty', '<=', 0);
            } elseif ($request->stock_status === 'low_stock') {
                $query->whereRaw('total_qty <= (SELECT low_stock_alert FROM products WHERE products.id = stock_summary.product_id)')
                      ->where('total_qty', '>', 0);
            } elseif ($request->stock_status === 'in_stock') {
                $query->whereRaw('total_qty > (SELECT low_stock_alert FROM products WHERE products.id = stock_summary.product_id)');
            }
        }

        $stockItems = $query->latest('last_updated_at')->paginate(15)->withQueryString();

        // Calculate total_value if it's 0 or null
        $stockItems->getCollection()->transform(function ($item) {
            if (!$item->total_value || $item->total_value == 0) {
                $item->total_value = (float)$item->total_qty * (float)$item->avg_purchase_price;
            }
            return $item;
        });

        $categories = Product::where('tenant_id', Auth::user()->tenant_id)
            ->with('category')
            ->get()
            ->pluck('category')
            ->filter()
            ->unique('id')
            ->values();

        return Inertia::render('Stock/Index', [
            'stockItems' => $stockItems,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'stock_status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $products = Product::where('tenant_id', Auth::user()->tenant_id)
            ->where('is_active', true)
            ->with('category')
            ->get(['id', 'name', 'code', 'category_id', 'unit']);

        return Inertia::render('Stock/Create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:opening,adjustment',
            'quantity' => 'required|numeric',
            'purchase_price' => 'nullable|numeric|min:0',
            'entry_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        // Verify product belongs to current tenant
        $product = Product::where('id', $validated['product_id'])
            ->where('tenant_id', Auth::user()->tenant_id)
            ->firstOrFail();

        DB::transaction(function () use ($validated, $product) {
            // Create stock entry
            $stockEntry = StockEntry::create([
                'tenant_id' => Auth::user()->tenant_id,
                'product_id' => $validated['product_id'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'purchase_price' => $validated['purchase_price'],
                'entry_date' => $validated['entry_date'],
                'notes' => $validated['notes'],
            ]);

            // Update stock summary
            StockSummary::updateStock(
                Auth::user()->tenant_id,
                $validated['product_id'],
                $validated['quantity'],
                $validated['purchase_price']
            );
        });

        return redirect()->route('stock.index')
            ->with('success', 'Stock entry created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(StockSummary $stock): Response
    {
        $stock->load('product.category');

        // Load recent stock entries separately
        $recentEntries = StockEntry::where('product_id', $stock->product_id)
            ->where('tenant_id', Auth::user()->tenant_id)
            ->latest('entry_date')
            ->limit(20)
            ->get();

        return Inertia::render('Stock/Show', [
            'stock' => $stock,
            'recentEntries' => $recentEntries,
        ]);
    }

    /**
     * Show stock history for a product
     */
    public function history(Product $product): Response
    {
        $this->authorize('view', $product);

        $entries = StockEntry::where('product_id', $product->id)
            ->latest('entry_date')
            ->paginate(20);

        return Inertia::render('Stock/History', [
            'product' => $product->load('category'),
            'entries' => $entries,
        ]);
    }

    /**
     * Bulk stock adjustment
     */
    public function bulkAdjustment(Request $request)
    {
        $validated = $request->validate([
            'adjustments' => 'required|array|min:1',
            'adjustments.*.product_id' => 'required|exists:products,id',
            'adjustments.*.quantity' => 'required|numeric',
            'adjustments.*.reason' => 'nullable|string|max:500',
            'entry_date' => 'required|date',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $adjustments = collect($validated['adjustments']);

        // Verify all products belong to current tenant
        $productIds = $adjustments->pluck('product_id');
        $validProducts = Product::where('tenant_id', $tenantId)
            ->whereIn('id', $productIds)
            ->count();

        if ($validProducts !== $productIds->count()) {
            return back()->withErrors(['adjustments' => 'Some products do not belong to your organization.']);
        }

        DB::transaction(function () use ($adjustments, $validated, $tenantId) {
            foreach ($adjustments as $adjustment) {
                // Create stock entry
                StockEntry::create([
                    'tenant_id' => $tenantId,
                    'product_id' => $adjustment['product_id'],
                    'type' => 'adjustment',
                    'quantity' => $adjustment['quantity'],
                    'entry_date' => $validated['entry_date'],
                    'notes' => $adjustment['reason'] ?? 'Bulk adjustment',
                ]);

                // Update stock summary
                StockSummary::updateStock(
                    $tenantId,
                    $adjustment['product_id'],
                    $adjustment['quantity']
                );
            }
        });

        return redirect()->route('stock.index')
            ->with('success', 'Bulk stock adjustment completed successfully.');
    }

    /**
     * Show low stock alert
     */
    public function lowStock(): Response
    {
        $lowStockItems = StockSummary::with(['product.category'])
            ->whereHas('product', function ($q) {
                $q->where('tenant_id', Auth::user()->tenant_id)
                  ->where('is_active', true);
            })
            ->whereRaw('total_qty <= (SELECT low_stock_alert FROM products WHERE products.id = stock_summary.product_id)')
            ->orderBy('total_qty', 'asc')
            ->get();

        return Inertia::render('Stock/LowStock', [
            'lowStockItems' => $lowStockItems,
        ]);
    }
}
