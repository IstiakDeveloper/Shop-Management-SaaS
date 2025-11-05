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

    // Calculate and update total (optional - only when explicitly called)
    public function calculateTotal(): void
    {
        $this->update(['total' => round((float)$this->quantity * (float)$this->unit_price, 2)]);
    }

    // Note: Auto-calculation removed to allow exact total amounts
    // Total will be calculated in controller based on user input
}
