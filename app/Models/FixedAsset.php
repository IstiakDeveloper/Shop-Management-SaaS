<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FixedAsset extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'purchase_date',
        'cost',
        'depreciation_rate',
        'accumulated_depreciation',
        'current_value',
        'status',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'cost' => 'decimal:2',
        'depreciation_rate' => 'decimal:2',
        'accumulated_depreciation' => 'decimal:2',
        'current_value' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Calculate annual depreciation amount
    public function getAnnualDepreciationAmount(): float
    {
        return ($this->cost * $this->depreciation_rate) / 100;
    }

    // Calculate monthly depreciation amount
    public function getMonthlyDepreciationAmount(): float
    {
        return $this->getAnnualDepreciationAmount() / 12;
    }

    // Calculate current book value
    public function getBookValue(): float
    {
        return $this->cost - $this->accumulated_depreciation;
    }

    // Update depreciation for a given period
    public function updateDepreciation(int $months = 1): void
    {
        $monthlyDepreciation = $this->getMonthlyDepreciationAmount();
        $totalDepreciation = $monthlyDepreciation * $months;

        $newAccumulatedDepreciation = min(
            $this->accumulated_depreciation + $totalDepreciation,
            $this->cost // Cannot depreciate more than original cost
        );

        $this->update([
            'accumulated_depreciation' => $newAccumulatedDepreciation,
            'current_value' => $this->cost - $newAccumulatedDepreciation,
        ]);
    }

    // Check if asset is fully depreciated
    public function isFullyDepreciated(): bool
    {
        return $this->accumulated_depreciation >= $this->cost;
    }

    // Get years of ownership
    public function getYearsOfOwnership(): float
    {
        return Carbon::parse($this->purchase_date)->diffInMonths(now()) / 12;
    }

    // Dispose the asset
    public function dispose(): void
    {
        $this->update(['status' => 'disposed']);
    }

    // Sell the asset
    public function sell(): void
    {
        $this->update(['status' => 'sold']);
    }

    // Scope for active assets
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Scope for disposed assets
    public function scopeDisposed($query)
    {
        return $query->where('status', 'disposed');
    }

    // Scope for sold assets
    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    // Scope for assets needing depreciation update
    public function scopeNeedingDepreciation($query)
    {
        return $query->where('status', 'active')
                    ->where('accumulated_depreciation', '<', DB::raw('cost'));
    }

    // Get status badge color
    public function getStatusColor(): string
    {
        return match($this->status) {
            'active' => 'success',
            'disposed' => 'warning',
            'sold' => 'info',
            default => 'secondary'
        };
    }
}
