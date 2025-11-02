<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class VendorController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $query = Vendor::where('tenant_id', Auth::user()->tenant_id)
            ->with(['purchases' => function ($q) {
                $q->latest('purchase_date');
            }]);

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'outstanding') {
                $query->where('current_due', '>', 0);
            }
        }

        $vendors = $query->orderBy('name')->paginate(20);

        return Inertia::render('Vendors/Index', [
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vendors/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'opening_due' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['tenant_id'] = Auth::user()->tenant_id;
        $validated['current_due'] = $validated['opening_due'] ?? 0;

        Vendor::create($validated);

        return redirect()->route('vendors.index')
            ->with('success', 'Vendor created successfully.');
    }

    public function show(Vendor $vendor): Response
    {
        // Check tenant access
        if ($vendor->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $vendor->load([
            'purchases' => function ($query) {
                $query->latest('purchase_date')->with('purchaseItems.product');
            }
        ]);

        return Inertia::render('Vendors/Show', [
            'vendor' => $vendor,
        ]);
    }

    public function edit(Vendor $vendor): Response
    {
        // Check tenant access
        if ($vendor->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        return Inertia::render('Vendors/Edit', [
            'vendor' => $vendor,
        ]);
    }

    public function update(Request $request, Vendor $vendor): RedirectResponse
    {
        // Check tenant access
        if ($vendor->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'opening_due' => 'nullable|numeric|min:0',
            'current_due' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $vendor->update($validated);

        return redirect()->route('vendors.show', $vendor)
            ->with('success', 'Vendor updated successfully.');
    }

    public function destroy(Vendor $vendor): RedirectResponse
    {
        // Check tenant access
        if ($vendor->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Check if vendor has any purchases
        if ($vendor->purchases()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete vendor with existing purchase records.'
            ]);
        }

        $vendor->delete();

        return redirect()->route('vendors.index')
            ->with('success', 'Vendor deleted successfully.');
    }

    public function payment(Request $request, Vendor $vendor): RedirectResponse
    {
        // Check tenant access
        if ($vendor->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:' . floatval($vendor->current_due)
            ],
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        // Additional check
        if ($validated['amount'] > floatval($vendor->current_due)) {
            return back()->withErrors(['amount' => 'Payment amount cannot exceed current due.']);
        }

        try {
            DB::beginTransaction();

            // Reduce vendor due
            $vendor->receivePayment($validated['amount']);

            // Create bank transaction (debit - money out from bank)
            BankTransaction::createDebit(
                Auth::user()->tenant_id,
                (float)$validated['amount'],
                "Payment to vendor {$vendor->name}" . ($validated['notes'] ? " - {$validated['notes']}" : ""),
                'vendor_payment',
                $vendor->id,
                'vendor',
                $validated['payment_date'],
                Auth::id()
            );

            DB::commit();

            return back()->with('success', "Payment of ৳" . number_format($validated['amount'], 2) . " recorded successfully. Bank debited.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to record payment: ' . $e->getMessage()]);
        }
    }
}
