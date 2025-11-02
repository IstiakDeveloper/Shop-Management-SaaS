<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Sale extends Model
{
    protected $fillable = [
        'tenant_id',
        'customer_id',
        'invoice_number',
        'sale_date',
        'subtotal',
        'discount',
        'discount_type',
        'total',
        'paid',
        'due',
        'status',
        'payment_method',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'sale_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'paid' => 'decimal:2',
        'due' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sale) {
            if (empty($sale->invoice_number)) {
                $sale->invoice_number = $sale->generateInvoiceNumber();
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    // Process stock and bank transaction after sale
    public function processStockAndBankTransaction(): void
    {
        DB::transaction(function () {
            // Deduct stock entries for each sale item
            foreach ($this->saleItems as $item) {
                // Get current stock summary for average price
                $stockSummary = StockSummary::where('tenant_id', $this->tenant_id)
                    ->where('product_id', $item->product_id)
                    ->first();

                StockEntry::create([
                    'tenant_id' => $this->tenant_id,
                    'product_id' => $item->product_id,
                    'type' => 'sale',
                    'quantity' => -$item->quantity, // Negative for outgoing
                    'purchase_price' => $stockSummary ? $stockSummary->avg_purchase_price : 0,
                    'sale_price' => $item->unit_price,
                    'entry_date' => $this->sale_date,
                    'reference_id' => $this->id,
                    'reference_type' => 'sale',
                    'notes' => "Sale #{$this->invoice_number}",
                ]);

                // Update stock summary (deduct quantity)
                StockSummary::updateStock(
                    $this->tenant_id,
                    $item->product_id,
                    -$item->quantity // Negative to deduct
                );
            }

            // Create bank transaction (credit - money in)
            BankTransaction::createCredit(
                $this->tenant_id,
                (float)$this->paid, // Only the paid amount goes to bank
                "Sale to " . ($this->customer ? $this->customer->name : 'Walk-in Customer') . " - Invoice: {$this->invoice_number}",
                'sale',
                $this->id,
                'sale',
                $this->sale_date,
                $this->created_by
            );
        });
    }

    // Generate unique invoice number
    public function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $lastSale = static::where('tenant_id', $this->tenant_id)
            ->where('invoice_number', 'like', "INV-{$date}-%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastSale) {
            $lastNumber = (int) substr($lastSale->invoice_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "INV-{$date}-{$newNumber}";
    }

    // Calculate totals based on sale items
    public function calculateTotals(): void
    {
        $subtotal = $this->saleItems()->sum(DB::raw('quantity * unit_price'));

        // Apply discount based on type
        if ($this->discount_type === 'percentage') {
            $discountAmount = $subtotal * ($this->discount / 100);
        } else {
            $discountAmount = $this->discount;
        }

        $total = $subtotal - $discountAmount;
        $due = $total - $this->paid;

        $this->update([
            'subtotal' => $subtotal,
            'total' => $total,
            'due' => max(0, $due),
        ]);
    }

    // Check if sale is fully paid
    public function isFullyPaid(): bool
    {
        return $this->due <= 0;
    }

    // Add payment to sale
    public function addPayment(float $amount, string $method = 'cash'): void
    {
        $newPaid = (float)$this->paid + $amount;
        $newDue = max(0, (float)$this->total - $newPaid);

        $this->update([
            'paid' => $newPaid,
            'due' => $newDue,
            'payment_method' => $method ?: $this->payment_method,
        ]);

        // Create additional bank transaction for the payment
        BankTransaction::createCredit(
            $this->tenant_id,
            $amount,
            "Payment received for Sale #{$this->invoice_number}",
            'sale',
            $this->id,
            'sale',
            now()->toDateString(),
            1
        );

        // Update customer due if customer exists
        if ($this->customer) {
            $this->customer->receivePayment($amount);
        }
    }

    // Complete the sale
    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
        ]);

        // Process stock and bank if not already done
        $this->processStockAndBankTransaction();

        // Update customer totals
        if ($this->customer) {
            $this->customer->updateTotalPurchases();
            $this->customer->updateOutstandingBalance();
        }
    }

    // Cancel the sale
    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);

        // Update customer balances
        if ($this->customer) {
            $this->customer->updateTotalPurchases();
            $this->customer->updateOutstandingBalance();
        }
    }

    // Check if sale can be edited (only pending sales)
    public function canBeEdited(): bool
    {
        return $this->status === 'pending';
    }

    // Check if sale can be deleted
    public function canBeDeleted(): bool
    {
        return in_array($this->status, ['pending', 'cancelled']);
    }

    // Scope for completed sales
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Scope for pending sales
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Scope for sales with outstanding balance
    public function scopeWithOutstanding($query)
    {
        return $query->where('due', '>', 0);
    }

    // Scope for today's sales
    public function scopeToday($query)
    {
        return $query->whereDate('sale_date', today());
    }

    // Scope for sales in date range
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('sale_date', [$startDate, $endDate]);
    }
}
