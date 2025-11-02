<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ProductCategoryController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = ProductCategory::with(['products'])
            ->where('tenant_id', Auth::user()->tenant_id);

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $categories = $query->withCount('products')
                           ->latest()
                           ->paginate(15)
                           ->withQueryString();

        return Inertia::render('ProductCategories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('ProductCategories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_categories,name,NULL,id,tenant_id,' . Auth::user()->tenant_id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['tenant_id'] = Auth::user()->tenant_id;

        ProductCategory::create($validated);

        return redirect()->route('product-categories.index')
            ->with('success', 'Product category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductCategory $productCategory): Response
    {
        // Check tenant access
        if ($productCategory->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $productCategory->load(['products' => function ($query) {
            $query->where('is_active', true)->latest();
        }]);

        return Inertia::render('ProductCategories/Show', [
            'category' => $productCategory,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductCategory $productCategory): Response
    {
        // Check tenant access
        if ($productCategory->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        return Inertia::render('ProductCategories/Edit', [
            'category' => $productCategory,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductCategory $productCategory): RedirectResponse
    {
        // Check tenant access
        if ($productCategory->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_categories,name,' . $productCategory->id . ',id,tenant_id,' . Auth::user()->tenant_id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $productCategory->update($validated);

        return redirect()->route('product-categories.index')
            ->with('success', 'Product category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        // Check tenant access
        if ($productCategory->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Check if category has products
        if ($productCategory->products()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete category with existing products. Please move or delete the products first.'
            ]);
        }

        $productCategory->delete();

        return redirect()->route('product-categories.index')
            ->with('success', 'Product category deleted successfully.');
    }
}
