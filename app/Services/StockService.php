<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockEntry;
use App\Models\StockSummary;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Create a stock entry and update summary
     */
    public function createStockEntry(array $data): StockEntry
    {
        return DB::transaction(function () use ($data) {
            // Create stock entry
            $stockEntry = StockEntry::create($data);

            // Update stock summary
            StockSummary::updateStock(
                $data['product_id'],
                $data['quantity'],
                $data['purchase_price'] ?? null
            );

            return $stockEntry;
        });
    }

    /**
     * Get current stock for a product
     */
    public function getCurrentStock(int $productId): float
    {
        $summary = StockSummary::where('product_id', $productId)->first();
        return $summary ? $summary->total_qty : 0;
    }

    /**
     * Get average purchase price for a product
     */
    public function getAveragePurchasePrice(int $productId): float
    {
        $summary = StockSummary::where('product_id', $productId)->first();
        return $summary ? $summary->avg_purchase_price : 0;
    }

    /**
     * Check if product has sufficient stock
     */
    public function hasSufficientStock(int $productId, float $requiredQuantity): bool
    {
        $currentStock = $this->getCurrentStock($productId);
        return $currentStock >= $requiredQuantity;
    }

    /**
     * Get low stock products for a tenant
     */
    public function getLowStockProducts(int $tenantId): \Illuminate\Database\Eloquent\Collection
    {
        return StockSummary::with(['product.category'])
            ->whereHas('product', function ($query) use ($tenantId) {
                $query->where('tenant_id', $tenantId)
                      ->where('is_active', true);
            })
            ->whereRaw('total_qty <= (SELECT low_stock_alert FROM products WHERE products.id = stock_summary.product_id)')
            ->orderBy('total_qty', 'asc')
            ->get();
    }

    /**
     * Get stock movement history for a product
     */
    public function getStockHistory(int $productId, int $limit = 50): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return StockEntry::where('product_id', $productId)
            ->latest('entry_date')
            ->latest('created_at')
            ->paginate($limit);
    }

    /**
     * Calculate total stock value for a tenant
     */
    public function getTotalStockValue(int $tenantId): float
    {
        return StockSummary::whereHas('product', function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId);
        })->sum('total_value');
    }

    /**
     * Get stock statistics for a tenant
     */
    public function getStockStatistics(int $tenantId): array
    {
        $products = Product::where('tenant_id', $tenantId)->where('is_active', true);
        $totalProducts = $products->count();

        $stockSummaries = StockSummary::whereHas('product', function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId)->where('is_active', true);
        })->get();

        $outOfStock = $stockSummaries->where('total_qty', '<=', 0)->count();
        $lowStock = $stockSummaries->filter(function ($summary) {
            return $summary->total_qty > 0 && $summary->total_qty <= $summary->product->low_stock_alert;
        })->count();

        $totalValue = $stockSummaries->sum('total_value');

        return [
            'total_products' => $totalProducts,
            'out_of_stock' => $outOfStock,
            'low_stock' => $lowStock,
            'in_stock' => $totalProducts - $outOfStock - $lowStock,
            'total_value' => $totalValue,
        ];
    }

    /**
     * Process bulk stock adjustments
     */
    public function processBulkAdjustments(array $adjustments, string $entryDate, int $tenantId): void
    {
        DB::transaction(function () use ($adjustments, $entryDate, $tenantId) {
            foreach ($adjustments as $adjustment) {
                // Create stock entry
                StockEntry::create([
                    'tenant_id' => $tenantId,
                    'product_id' => $adjustment['product_id'],
                    'type' => 'adjustment',
                    'quantity' => $adjustment['quantity'],
                    'entry_date' => $entryDate,
                    'notes' => $adjustment['reason'] ?? 'Bulk adjustment',
                ]);

                // Update stock summary
                StockSummary::updateStock(
                    $adjustment['product_id'],
                    $adjustment['quantity']
                );
            }
        });
    }

    /**
     * Reserve stock for a sale (reduce available stock)
     */
    public function reserveStock(int $productId, float $quantity, int $saleId = null): bool
    {
        if (!$this->hasSufficientStock($productId, $quantity)) {
            return false;
        }

        return DB::transaction(function () use ($productId, $quantity, $saleId) {
            // Create negative stock entry for sale
            StockEntry::create([
                'tenant_id' => Product::find($productId)->tenant_id,
                'product_id' => $productId,
                'type' => 'sale',
                'quantity' => -$quantity, // Negative for outgoing
                'entry_date' => now()->toDateString(),
                'reference_id' => $saleId,
                'reference_type' => 'sale',
                'notes' => 'Stock reserved for sale',
            ]);

            // Update stock summary
            StockSummary::updateStock($productId, -$quantity);

            return true;
        });
    }

    /**
     * Return reserved stock (increase available stock)
     */
    public function returnStock(int $productId, float $quantity, string $reason = 'Stock return'): void
    {
        DB::transaction(function () use ($productId, $quantity, $reason) {
            // Create positive stock entry for return
            StockEntry::create([
                'tenant_id' => Product::find($productId)->tenant_id,
                'product_id' => $productId,
                'type' => 'adjustment',
                'quantity' => $quantity, // Positive for incoming
                'entry_date' => now()->toDateString(),
                'notes' => $reason,
            ]);

            // Update stock summary
            StockSummary::updateStock($productId, $quantity);
        });
    }
}
