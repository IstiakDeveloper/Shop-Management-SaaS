<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\StockEntry;
use App\Models\StockSummary;
use App\Models\BankTransaction;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    use AuthorizesRequests;

    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index(): Response
    {
        $purchases = Purchase::with(['vendor', 'createdBy', 'purchaseItems.product'])
            ->where('tenant_id', Auth::user()->tenant_id)
            ->orderBy('purchase_date', 'desc')
            ->paginate(20);

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
        ]);
    }

    public function create(): Response
    {
        $vendors = Vendor::where('tenant_id', Auth::user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $products = Product::where('tenant_id', Auth::user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Purchases/Create', [
            'vendors' => $vendors,
            'products' => $products,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'purchase_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:purchase_date',
            'reference_number' => 'nullable|string|max:255',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;

            // Calculate subtotal
            foreach ($validated['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            // Empty paid_amount means full payment
            $paidAmount = isset($validated['paid_amount']) && $validated['paid_amount'] !== ''
                ? (float)$validated['paid_amount']
                : $subtotal;

            $dueAmount = $subtotal - $paidAmount;

            // Create purchase (always completed - product received)
            $purchase = Purchase::create([
                'tenant_id' => Auth::user()->tenant_id,
                'vendor_id' => $validated['vendor_id'],
                'created_by' => Auth::id(),
                'purchase_date' => $validated['purchase_date'],
                'due_date' => $validated['due_date'] ?? null,
                'invoice_number' => $validated['reference_number'] ?? Purchase::generateInvoiceNumber(),
                'notes' => $validated['notes'] ?? null,
                'status' => 'completed',
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'paid' => $paidAmount,
                'due' => $dueAmount,
            ]);

            // Create purchase items
            foreach ($validated['items'] as $item) {
                $itemTotal = $item['quantity'] * $item['unit_price'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $itemTotal,
                ]);
            }

            // Always add to stock
            $purchase->load('purchaseItems');
            $purchase->addToStock();

            // Debit bank for paid amount
            if ($paidAmount > 0) {
                $purchase->debitBank($paidAmount);
            }

            // Add due to vendor
            if ($dueAmount > 0) {
                $vendor = Vendor::find($validated['vendor_id']);
                $vendor->updateDue($dueAmount);
            }

            DB::commit();

            $message = $dueAmount > 0
                ? "Purchase completed. Stock added, ৳{$paidAmount} paid from bank, ৳{$dueAmount} due added to vendor."
                : "Purchase completed. Stock added and ৳{$paidAmount} paid from bank.";

            return redirect()->route('purchases.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create purchase: ' . $e->getMessage()]);
        }
    }    public function show(Purchase $purchase): Response
    {
        // Check tenant access
        if ($purchase->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $purchase->load(['vendor', 'createdBy', 'purchaseItems.product']);

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function edit(Purchase $purchase): Response
    {
        // Check tenant access
        if ($purchase->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $vendors = Vendor::where('tenant_id', Auth::user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $products = Product::where('tenant_id', Auth::user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $purchase->load(['vendor', 'purchaseItems.product']);

        return Inertia::render('Purchases/Edit', [
            'purchase' => $purchase,
            'vendors' => $vendors,
            'products' => $products,
        ]);
    }

    public function update(Request $request, Purchase $purchase): RedirectResponse
    {
        // Check tenant access
        if ($purchase->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'purchase_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:purchase_date',
            'reference_number' => 'nullable|string|max:255',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Calculate old values
            $oldTotal = $purchase->total;
            $oldPaid = $purchase->paid;
            $oldDue = $purchase->due;
            $oldVendorId = $purchase->vendor_id;

            // Calculate new subtotal
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            // Empty paid_amount means full payment
            $paidAmount = isset($validated['paid_amount']) && $validated['paid_amount'] !== ''
                ? (float)$validated['paid_amount']
                : $subtotal;

            $dueAmount = $subtotal - $paidAmount;

            // Reverse old stock entries
            foreach ($purchase->purchaseItems as $oldItem) {
                StockEntry::create([
                    'tenant_id' => $purchase->tenant_id,
                    'product_id' => $oldItem->product_id,
                    'type' => 'adjustment',
                    'quantity' => -$oldItem->quantity,
                    'purchase_price' => $oldItem->unit_price,
                    'entry_date' => now(),
                    'reference_id' => $purchase->id,
                    'reference_type' => 'purchase_update',
                    'notes' => "Reversed for purchase update #{$purchase->invoice_number}",
                ]);

                StockSummary::updateStock(
                    $purchase->tenant_id,
                    $oldItem->product_id,
                    -$oldItem->quantity,
                    $oldItem->unit_price
                );
            }

            // Delete old purchase items
            $purchase->purchaseItems()->delete();

            // Update purchase
            $purchase->update([
                'vendor_id' => $validated['vendor_id'],
                'purchase_date' => $validated['purchase_date'],
                'due_date' => $validated['due_date'] ?? null,
                'invoice_number' => $validated['reference_number'] ?? $purchase->invoice_number,
                'notes' => $validated['notes'] ?? null,
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'paid' => $paidAmount,
                'due' => $dueAmount,
            ]);

            // Create new purchase items
            foreach ($validated['items'] as $item) {
                $itemTotal = $item['quantity'] * $item['unit_price'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $itemTotal,
                ]);
            }

            // Add new stock
            $purchase->load('purchaseItems');
            $purchase->addToStock();

            // Adjust bank transaction
            $paidDifference = $paidAmount - $oldPaid;
            if ($paidDifference != 0) {
                if ($paidDifference > 0) {
                    // Need to pay more
                    BankTransaction::createDebit(
                        Auth::user()->tenant_id,
                        abs($paidDifference),
                        "Additional payment for purchase #{$purchase->invoice_number}",
                        'purchase',
                        $purchase->id,
                        'purchase',
                        $validated['purchase_date'],
                        Auth::id()
                    );
                } else {
                    // Paid less (refund)
                    BankTransaction::create([
                        'tenant_id' => Auth::user()->tenant_id,
                        'type' => 'credit',
                        'category' => 'adjustment',
                        'amount' => abs($paidDifference),
                        'balance_after' => 0, // Will be recalculated
                        'transaction_date' => $validated['purchase_date'],
                        'description' => "Refund for purchase update #{$purchase->invoice_number}",
                        'reference_id' => $purchase->id,
                        'reference_type' => 'purchase',
                        'created_by' => Auth::id(),
                    ]);
                }
            }

            // Adjust vendor due
            $dueDifference = $dueAmount - $oldDue;
            if ($dueDifference != 0) {
                $vendor = Vendor::find($validated['vendor_id']);
                if ($dueDifference > 0) {
                    $vendor->updateDue($dueDifference);
                } else {
                    $vendor->receivePayment(abs($dueDifference));
                }
            }

            // If vendor changed, adjust old vendor
            if ($oldVendorId != $validated['vendor_id'] && $oldDue > 0) {
                $oldVendor = Vendor::find($oldVendorId);
                $oldVendor->receivePayment((float)$oldDue);
            }

            DB::commit();

            return redirect()->route('purchases.show', $purchase)
                ->with('success', 'Purchase updated successfully. Stock and bank adjusted.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update purchase: ' . $e->getMessage()]);
        }
    }

    public function destroy(Purchase $purchase): RedirectResponse
    {
        // Check tenant access
        if ($purchase->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        try {
            // Note: Deleting purchase does not reverse stock/bank transactions
            // This is intentional - use adjustment entries for corrections
            $purchase->delete();

            return redirect()->route('purchases.index')
                ->with('success', 'Purchase record deleted successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete purchase: ' . $e->getMessage()]);
        }
    }
}
