<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Purchase extends Model
{
    protected $fillable = [
        'tenant_id',
        'vendor_id',
        'invoice_number',
        'purchase_date',
        'due_date',
        'subtotal',
        'discount',
        'total',
        'paid',
        'due',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'paid' => 'decimal:2',
        'due' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Add items to stock
    public function addToStock(): void
    {
        foreach ($this->purchaseItems as $item) {
            StockEntry::create([
                'tenant_id' => $this->tenant_id,
                'product_id' => $item->product_id,
                'type' => 'purchase',
                'quantity' => $item->quantity,
                'purchase_price' => $item->unit_price,
                'entry_date' => $this->purchase_date,
                'reference_id' => $this->id,
                'reference_type' => 'purchase',
                'notes' => "Purchase #{$this->invoice_number}",
            ]);

            // Update stock summary
            StockSummary::updateStock(
                $this->tenant_id,
                $item->product_id,
                $item->quantity,
                $item->unit_price
            );
        }
    }

    // Debit bank for payment
    public function debitBank(float $amount): void
    {
        BankTransaction::createDebit(
            $this->tenant_id,
            $amount,
            "Purchase from {$this->vendor->name} - Invoice: {$this->invoice_number}",
            'purchase',
            $this->id,
            'purchase',
            $this->purchase_date,
            $this->created_by
        );
    }

    // Process stock and bank transaction after purchase
    public function processStockAndBankTransaction(?float $paidAmount = null): void
    {
        DB::transaction(function () use ($paidAmount) {
            // Add stock entries for each purchase item
            foreach ($this->purchaseItems as $item) {
                StockEntry::create([
                    'tenant_id' => $this->tenant_id,
                    'product_id' => $item->product_id,
                    'type' => 'purchase',
                    'quantity' => $item->quantity,
                    'purchase_price' => $item->unit_price,
                    'entry_date' => $this->purchase_date,
                    'reference_id' => $this->id,
                    'reference_type' => 'purchase',
                    'notes' => "Purchase #{$this->invoice_number}",
                ]);

                // Update stock summary
                StockSummary::updateStock(
                    $this->tenant_id,
                    $item->product_id,
                    $item->quantity,
                    $item->unit_price
                );
            }

            // Create bank transaction only for paid amount (debit - money out)
            $amount = $paidAmount ?? $this->paid;
            if ($amount > 0) {
                BankTransaction::createDebit(
                    $this->tenant_id,
                    (float)$amount,
                    "Purchase from {$this->vendor->name} - Invoice: {$this->invoice_number}",
                    'purchase',
                    $this->id,
                    'purchase',
                    $this->purchase_date,
                    $this->created_by
                );
            }
        });
    }

    // Calculate totals
    public function calculateTotals(): void
    {
        $subtotal = $this->purchaseItems()->sum('total');
        $total = $subtotal - $this->discount;
        $due = $total - $this->paid;

        $this->update([
            'subtotal' => $subtotal,
            'total' => $total,
            'due' => $due,
        ]);
    }

    // Generate unique invoice number
    public static function generateInvoiceNumber(): string
    {
        $lastPurchase = static::latest('id')->first();
        $nextNumber = $lastPurchase ? $lastPurchase->id + 1 : 1;
        return 'PUR-' . date('Y') . '-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
