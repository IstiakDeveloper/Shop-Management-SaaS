<?php

namespace App\Http\Controllers;

use App\Models\FixedAsset;
use App\Models\Account;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FixedAssetController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $query = FixedAsset::where('tenant_id', Auth::user()->tenant_id);

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $assets = $query->latest('purchase_date')->paginate(15)->withQueryString();

        // Summary calculations
        $summary = [
            'total_assets' => FixedAsset::where('tenant_id', Auth::user()->tenant_id)->count(),
            'active_assets' => FixedAsset::where('tenant_id', Auth::user()->tenant_id)->active()->count(),
            'total_cost' => FixedAsset::where('tenant_id', Auth::user()->tenant_id)->sum('cost'),
            'total_depreciation' => FixedAsset::where('tenant_id', Auth::user()->tenant_id)->sum('accumulated_depreciation'),
            'net_book_value' => FixedAsset::where('tenant_id', Auth::user()->tenant_id)->sum('current_value'),
        ];

        return Inertia::render('FixedAssets/Index', [
            'assets' => $assets,
            'summary' => $summary,
            'filters' => $request->only(['search', 'status']),
            'statuses' => ['active', 'disposed', 'sold'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('FixedAssets/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'purchase_date' => 'required|date',
            'cost' => 'required|numeric|min:0.01',
            'depreciation_rate' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,disposed,sold',
        ]);

        try {
            DB::beginTransaction();

            $validated['tenant_id'] = Auth::user()->tenant_id;
            $validated['current_value'] = $validated['cost']; // Initial value equals cost
            $validated['accumulated_depreciation'] = 0; // Start with zero depreciation

            // Create fixed asset
            $fixedAsset = FixedAsset::create($validated);

            // Create or update fixed asset account
            $fixedAssetAccount = Account::firstOrCreate(
                [
                    'tenant_id' => Auth::user()->tenant_id,
                    'type' => 'fixed_asset',
                    'is_system' => false,
                    'name' => 'Fixed Assets',
                ],
                [
                    'description' => 'Total value of all fixed assets',
                    'opening_balance' => 0,
                    'current_balance' => 0,
                ]
            );

            // Add to fixed asset account balance
            $fixedAssetAccount->credit($validated['cost']);

            // Debit from bank account (money out)
            BankTransaction::createDebit(
                Auth::user()->tenant_id,
                $validated['cost'],
                'Fixed asset purchase: ' . $validated['name'],
                'fixed_asset',
                $fixedAsset->id,
                FixedAsset::class,
                $validated['purchase_date'],
                Auth::id()
            );

            DB::commit();

            return redirect()->route('fixed-assets.index')
                ->with('success', 'Fixed asset purchased successfully. Bank account debited ৳' . number_format($validated['cost'], 2));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Fixed asset creation failed: ' . $e->getMessage());
            return back()->withInput()->withErrors(['error' => 'Failed to create fixed asset: ' . $e->getMessage()]);
        }
    }

    public function show(FixedAsset $fixedAsset): Response
    {
        // Check tenant access
        if ($fixedAsset->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Calculate additional information
        $data = [
            'asset' => $fixedAsset,
            'depreciation_info' => [
                'annual_depreciation' => $fixedAsset->getAnnualDepreciationAmount(),
                'monthly_depreciation' => $fixedAsset->getMonthlyDepreciationAmount(),
                'years_owned' => $fixedAsset->getYearsOfOwnership(),
                'book_value' => $fixedAsset->getBookValue(),
                'is_fully_depreciated' => $fixedAsset->isFullyDepreciated(),
            ]
        ];

        return Inertia::render('FixedAssets/Show', $data);
    }

    public function edit(FixedAsset $fixedAsset): Response
    {
        // Check tenant access
        if ($fixedAsset->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        return Inertia::render('FixedAssets/Edit', [
            'asset' => $fixedAsset,
            'statuses' => ['active', 'disposed', 'sold'],
        ]);
    }

    public function update(Request $request, FixedAsset $fixedAsset): RedirectResponse
    {
        // Check tenant access
        if ($fixedAsset->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'purchase_date' => 'required|date',
            'cost' => 'required|numeric|min:0',
            'depreciation_rate' => 'required|numeric|min:0|max:100',
            'accumulated_depreciation' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,disposed,sold',
        ]);

        // If cost changed, recalculate current value
        if ($fixedAsset->cost != $validated['cost']) {
            $validated['current_value'] = $validated['cost'] - ($validated['accumulated_depreciation'] ?? $fixedAsset->accumulated_depreciation);
        }

        $fixedAsset->update($validated);

        return redirect()->route('fixed-assets.show', $fixedAsset)
            ->with('success', 'Fixed asset updated successfully.');
    }

    public function destroy(FixedAsset $fixedAsset): RedirectResponse
    {
        // Check tenant access
        if ($fixedAsset->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $fixedAsset->delete();

        return redirect()->route('fixed-assets.index')
            ->with('success', 'Fixed asset deleted successfully.');
    }

    public function updateDepreciation(Request $request, FixedAsset $fixedAsset): RedirectResponse
    {
        // Check tenant access
        if ($fixedAsset->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'months' => 'required|integer|min:1|max:12',
        ]);

        try {
            $fixedAsset->updateDepreciation($validated['months']);

            return back()->with('success', 'Depreciation updated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update depreciation: ' . $e->getMessage()]);
        }
    }

    public function dispose(FixedAsset $fixedAsset): RedirectResponse
    {
        // Check tenant access
        if ($fixedAsset->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $fixedAsset->dispose();

        return back()->with('success', 'Asset marked as disposed.');
    }

    public function sell(FixedAsset $fixedAsset): RedirectResponse
    {
        // Check tenant access
        if ($fixedAsset->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $fixedAsset->sell();

        return back()->with('success', 'Asset marked as sold.');
    }

    public function depreciationReport(Request $request): Response
    {
        $query = FixedAsset::where('tenant_id', Auth::user()->tenant_id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $assets = $query->orderBy('purchase_date')->get();

        return Inertia::render('FixedAssets/DepreciationReport', [
            'assets' => $assets,
            'filters' => $request->only(['status']),
        ]);
    }
}
