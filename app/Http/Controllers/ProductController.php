<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['category', 'stockSummary'])
            ->where('tenant_id', Auth::user()->tenant_id);

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $products = $query->latest()->paginate(15)->withQueryString();

        $categories = ProductCategory::where('tenant_id', auth()->user()->tenant_id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $categories = ProductCategory::where('tenant_id', Auth::user()->tenant_id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return Inertia::render('Products/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100|unique:products,code,NULL,id,tenant_id,' . Auth::user()->tenant_id,
            'category_id' => 'nullable|exists:product_categories,id',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'sale_price' => 'required|numeric|min:0',
            'low_stock_alert' => 'required|integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $validated['tenant_id'] = Auth::user()->tenant_id;

        // Handle image storage - convert base64 to file if needed
        if (isset($validated['images']) && is_array($validated['images'])) {
            $storedImages = [];
            foreach ($validated['images'] as $image) {
                // If it's a base64 string, store it as is for now
                // In production, you should upload to a proper storage
                $storedImages[] = $image;
            }
            $validated['images'] = $storedImages;
        }

        $product = Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): Response
    {
        $this->authorize('view', $product);

        $product->load(['category', 'stockSummary', 'stockEntries' => function($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        $categories = ProductCategory::where('tenant_id', Auth::user()->tenant_id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100|unique:products,code,' . $product->id . ',id,tenant_id,' . Auth::user()->tenant_id,
            'category_id' => 'nullable|exists:product_categories,id',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'sale_price' => 'required|numeric|min:0',
            'low_stock_alert' => 'required|integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
        ]);

        // Handle image storage - convert base64 to file if needed
        if (isset($validated['images']) && is_array($validated['images'])) {
            $storedImages = [];
            foreach ($validated['images'] as $image) {
                // If it's a base64 string, store it as is for now
                // In production, you should upload to a proper storage
                $storedImages[] = $image;
            }
            $validated['images'] = $storedImages;
        }

        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        // Check if product has stock or transactions
        if ($product->stockSummary && $product->stockSummary->total_qty > 0) {
            return back()->with('error', 'Cannot delete product with existing stock.');
        }

        if ($product->purchaseItems()->exists() || $product->saleItems()->exists()) {
            return back()->with('error', 'Cannot delete product with existing transactions.');
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
