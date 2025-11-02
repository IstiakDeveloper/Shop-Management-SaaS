<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
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

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
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

    // Calculate total sales amount
    public function getTotalSalesAmount(): float
    {
        return $this->sales()->where('status', 'completed')->sum('total');
    }

    // Calculate total outstanding amount
    public function getTotalOutstanding(): float
    {
        return $this->sales()->where('due', '>', 0)->sum('due');
    }

    // Get recent sales
    public function getRecentSales(int $limit = 10)
    {
        return $this->sales()
            ->latest('sale_date')
            ->limit($limit)
            ->get();
    }

    // Scope for active customers
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for customers with outstanding balance
    public function scopeWithOutstanding($query)
    {
        return $query->where('current_due', '>', 0);
    }

    // Search customers
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }
}
