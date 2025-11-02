<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillingInvoice extends Model
{
    protected $fillable = [
        'tenant_id',
        'tenant_subscription_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'status',
        'paid_at',
        'payment_method',
        'transaction_id',
        'notes',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function tenantSubscription(): BelongsTo
    {
        return $this->belongsTo(TenantSubscription::class);
    }

    public function billingPayments(): HasMany
    {
        return $this->hasMany(BillingPayment::class);
    }

    // Check if invoice is paid
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    // Check if invoice is overdue
    public function isOverdue(): bool
    {
        return $this->due_date->isPast() && $this->status === 'pending';
    }

    // Mark as paid
    public function markAsPaid(string $paymentMethod = null, string $transactionId = null): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
            'transaction_id' => $transactionId,
        ]);
    }

    // Get total paid amount
    public function getTotalPaidAmount(): float
    {
        return $this->billingPayments()->where('status', 'completed')->sum('amount');
    }

    // Get remaining amount
    public function getRemainingAmount(): float
    {
        return max(0, $this->total_amount - $this->getTotalPaidAmount());
    }

    // Generate unique invoice number
    public static function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $month = now()->format('m');

        $lastInvoice = static::where('invoice_number', 'like', "INV-{$year}{$month}-%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "INV-{$year}{$month}-{$newNumber}";
    }

    // Calculate totals
    public function calculateTotals(): void
    {
        $this->tax_amount = $this->subtotal * ($this->tax_rate / 100);
        $this->total_amount = $this->subtotal + $this->tax_amount - $this->discount_amount;
        $this->save();
    }

    // Get status badge color
    public function getStatusColor(): string
    {
        return match($this->status) {
            'paid' => 'success',
            'pending' => 'warning',
            'overdue' => 'destructive',
            'cancelled' => 'secondary',
            default => 'secondary'
        };
    }

    // Scope for pending invoices
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Scope for overdue invoices
    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')->where('due_date', '<', now());
    }

    // Scope for paid invoices
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
