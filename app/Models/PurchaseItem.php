<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseItem extends Model
{
    protected $fillable = [
        'purchase_id',
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

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
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

        static::saving(function ($purchaseItem) {
            $purchaseItem->total = round((float)$purchaseItem->quantity * (float)$purchaseItem->unit_price, 2);
        });
    }
}
