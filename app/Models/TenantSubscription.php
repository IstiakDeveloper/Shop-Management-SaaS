<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class TenantSubscription extends Model
{
    protected $fillable = [
        'tenant_id',
        'subscription_plan_id',
        'billing_cycle',
        'amount',
        'starts_at',
        'expires_at',
        'next_billing_date',
        'status',
        'cancelled_at',
        'cancellation_reason',
        'auto_renew',
        'plan_features_snapshot',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'date',
        'expires_at' => 'date',
        'next_billing_date' => 'date',
        'cancelled_at' => 'datetime',
        'auto_renew' => 'boolean',
        'plan_features_snapshot' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    public function billingInvoices(): HasMany
    {
        return $this->hasMany(BillingInvoice::class);
    }

    // Check if subscription is active
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->expires_at->isFuture();
    }

    // Check if subscription is expired
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    // Check if subscription is expiring soon (within 7 days)
    public function isExpiringSoon(): bool
    {
        return $this->expires_at->diffInDays(now()) <= 7 && $this->expires_at->isFuture();
    }

    // Get days remaining
    public function getDaysRemaining(): int
    {
        return max(0, $this->expires_at->diffInDays(now()));
    }

    // Cancel subscription
    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'auto_renew' => false,
        ]);
    }

    // Renew subscription
    public function renew(): void
    {
        $plan = $this->subscriptionPlan;
        $newExpiresAt = $this->billing_cycle === 'yearly'
            ? $this->expires_at->addYear()
            : $this->expires_at->addMonth();

        $this->update([
            'status' => 'active',
            'expires_at' => $newExpiresAt,
            'next_billing_date' => $newExpiresAt,
            'amount' => $plan->getPrice($this->billing_cycle),
        ]);
    }

    // Suspend subscription
    public function suspend(): void
    {
        $this->update(['status' => 'suspended']);
    }

    // Reactivate subscription
    public function reactivate(): void
    {
        $this->update(['status' => 'active']);
    }

    // Get status badge color
    public function getStatusColor(): string
    {
        return match($this->status) {
            'active' => 'success',
            'cancelled' => 'destructive',
            'expired' => 'warning',
            'suspended' => 'secondary',
            default => 'secondary'
        };
    }

    // Scope for active subscriptions
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Scope for expiring subscriptions
    public function scopeExpiring($query, int $days = 7)
    {
        return $query->where('expires_at', '<=', now()->addDays($days))
                    ->where('expires_at', '>', now())
                    ->where('status', 'active');
    }

    // Scope for expired subscriptions
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }
}
