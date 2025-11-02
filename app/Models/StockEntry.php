<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockEntry extends Model
{
    protected $fillable = [
        'tenant_id',
        'product_id',
        'type',
        'quantity',
        'purchase_price',
        'sale_price',
        'entry_date',
        'reference_id',
        'reference_type',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'entry_date' => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Scope for different types of entries
    public function scopeOpeningStock($query)
    {
        return $query->where('type', 'opening');
    }

    public function scopePurchases($query)
    {
        return $query->where('type', 'purchase');
    }

    public function scopeSales($query)
    {
        return $query->where('type', 'sale');
    }

    public function scopeAdjustments($query)
    {
        return $query->where('type', 'adjustment');
    }
}
