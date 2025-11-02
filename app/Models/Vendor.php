<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'company_name',
        'phone',
        'email',
        'address',
        'opening_due',
        'current_due',
        'is_active',
    ];

    protected $casts = [
        'opening_due' => 'decimal:2',
        'current_due' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    // Calculate total amount due (opening + current)
    public function getTotalDue(): float
    {
        return $this->opening_due + $this->current_due;
    }

    // Update current due amount
    public function updateDue(float $amount): void
    {
        $this->increment('current_due', $amount);
    }

    // Payment received - reduce due amount
    public function receivePayment(float $amount): void
    {
        $this->decrement('current_due', $amount);
    }

    // Get recent purchases
    public function getRecentPurchases(int $limit = 10)
    {
        return $this->purchases()
            ->latest('purchase_date')
            ->limit($limit)
            ->get();
    }

    // Get total purchase amount
    public function getTotalPurchaseAmount(): float
    {
        return $this->purchases()->sum('total');
    }

    // Get total paid amount
    public function getTotalPaidAmount(): float
    {
        return $this->purchases()->sum('paid');
    }
}
