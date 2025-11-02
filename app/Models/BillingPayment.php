<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingPayment extends Model
{
    protected $fillable = [
        'billing_invoice_id',
        'tenant_id',
        'amount',
        'payment_method',
        'transaction_id',
        'reference_number',
        'payment_date',
        'status',
        'payment_details',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'payment_details' => 'array',
    ];

    public function billingInvoice(): BelongsTo
    {
        return $this->belongsTo(BillingInvoice::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Check if payment is completed
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    // Check if payment is pending
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // Check if payment failed
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    // Mark as completed
    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);

        // Update invoice status if fully paid
        $invoice = $this->billingInvoice;
        if ($invoice->getRemainingAmount() <= 0) {
            $invoice->markAsPaid($this->payment_method, $this->transaction_id);
        }
    }

    // Mark as failed
    public function markAsFailed(string $reason = null): void
    {
        $this->update([
            'status' => 'failed',
            'notes' => $reason,
        ]);
    }

    // Refund payment
    public function refund(string $reason = null): void
    {
        $this->update([
            'status' => 'refunded',
            'notes' => $reason,
        ]);
    }

    // Get status badge color
    public function getStatusColor(): string
    {
        return match($this->status) {
            'completed' => 'success',
            'pending' => 'warning',
            'failed' => 'destructive',
            'refunded' => 'secondary',
            default => 'secondary'
        };
    }

    // Generate unique reference number
    public static function generateReferenceNumber(): string
    {
        return 'PAY-' . now()->format('YmdHis') . '-' . rand(1000, 9999);
    }

    // Scope for completed payments
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Scope for pending payments
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Scope for failed payments
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
