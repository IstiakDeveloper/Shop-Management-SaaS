<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'monthly_price',
        'yearly_price',
        'features',
        'max_users',
        'max_products',
        'max_customers',
        'max_vendors',
        'multi_location',
        'advanced_reports',
        'api_access',
        'priority_support',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'multi_location' => 'boolean',
        'advanced_reports' => 'boolean',
        'api_access' => 'boolean',
        'priority_support' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tenantSubscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }

    public function activeTenants(): HasMany
    {
        return $this->hasMany(TenantSubscription::class)->where('status', 'active');
    }

    // Get price based on billing cycle
    public function getPrice(string $cycle = 'monthly'): float
    {
        return $cycle === 'yearly' ? $this->yearly_price : $this->monthly_price;
    }

    // Calculate yearly savings
    public function getYearlySavings(): float
    {
        return ($this->monthly_price * 12) - $this->yearly_price;
    }

    // Get savings percentage
    public function getSavingsPercentage(): float
    {
        if ($this->monthly_price == 0) return 0;
        return round((($this->monthly_price * 12 - $this->yearly_price) / ($this->monthly_price * 12)) * 100, 1);
    }

    // Check if plan has feature
    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features ?? []);
    }

    // Scope for active plans
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for ordering
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('monthly_price');
    }

    // Get most popular plan
    public static function getMostPopular()
    {
        return static::withCount('activeTenants')
            ->active()
            ->orderBy('active_tenants_count', 'desc')
            ->first();
    }
}
