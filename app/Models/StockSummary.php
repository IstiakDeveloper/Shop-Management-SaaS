<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockSummary extends Model
{
    protected $table = 'stock_summary';

    protected $fillable = [
        'tenant_id',
        'product_id',
        'total_qty',
        'avg_purchase_price',
        'total_value',
        'last_updated_at',
    ];

    protected $casts = [
        'total_qty' => 'decimal:2',
        'avg_purchase_price' => 'decimal:6',  // More precision for accurate calculations
        'total_value' => 'decimal:2',
        'last_updated_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Update stock summary with new stock entry
     * Implements weighted average price calculation
     */
    public static function updateStock(int $tenantId, int $productId, float $quantity, ?float $purchasePrice = null): void
    {
        $summary = static::firstOrCreate(
            [
                'tenant_id' => $tenantId,
                'product_id' => $productId
            ],
            [
                'total_qty' => 0,
                'avg_purchase_price' => 0,
                'total_value' => 0
            ]
        );

        $oldQty = (float)$summary->total_qty;
        $oldAvgPrice = (float)$summary->avg_purchase_price;

        $newQty = $oldQty + $quantity;

        // Calculate new average price only for incoming stock with purchase price
        // Keep exact values, no rounding - let database handle precision
        if ($quantity > 0 && $purchasePrice !== null) {
            if ($oldQty > 0) {
                $newAvgPrice = (($oldQty * $oldAvgPrice) + ($quantity * $purchasePrice)) / $newQty;
            } else {
                $newAvgPrice = $purchasePrice;
            }
        } else {
            $newAvgPrice = $oldAvgPrice;
        }

        $totalValue = $newQty * $newAvgPrice;

        $summary->update([
            'total_qty' => $newQty,
            'avg_purchase_price' => $newAvgPrice,
            'total_value' => $totalValue,
            'last_updated_at' => now(),
        ]);
    }
}
