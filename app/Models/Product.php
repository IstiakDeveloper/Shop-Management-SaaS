<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    protected $fillable = [
        'tenant_id',
        'category_id',
        'name',
        'code',
        'description',
        'unit',
        'sale_price',
        'images',
        'low_stock_alert',
        'is_active',
    ];

    protected $casts = [
        'sale_price' => 'decimal:2',
        'images' => 'array',
        'low_stock_alert' => 'integer',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function stockEntries(): HasMany
    {
        return $this->hasMany(StockEntry::class);
    }

    public function stockSummary(): HasOne
    {
        return $this->hasOne(StockSummary::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    // Helper methods
    public function getCurrentStock(): float
    {
        return $this->stockSummary?->total_qty ?? 0;
    }

    public function getAveragePurchasePrice(): float
    {
        return $this->stockSummary?->avg_purchase_price ?? 0;
    }

    public function getTotalStockValue(): float
    {
        return $this->getCurrentStock() * $this->getAveragePurchasePrice();
    }

    public function isLowStock(): bool
    {
        return $this->getCurrentStock() <= $this->low_stock_alert;
    }
}
