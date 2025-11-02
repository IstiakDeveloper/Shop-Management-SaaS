<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'quantity',
        'unit_price',
        'total',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Calculate and update total
    public function calculateTotal(): void
    {
        $this->update(['total' => round((float)$this->quantity * (float)$this->unit_price, 2)]);
    }

    // Boot method to auto-calculate total
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($saleItem) {
            $saleItem->total = round((float)$saleItem->quantity * (float)$saleItem->unit_price, 2);
        });
    }
}
