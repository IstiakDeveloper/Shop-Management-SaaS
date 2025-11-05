<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DebugStockCalculation extends Command
{
    protected $signature = 'debug:stock {product_id} {tenant_id?} {--year=2025}';
    protected $description = 'Debug stock calculation for a specific product';

    public function handle()
    {
        $productId = $this->argument('product_id');
        $tenantId = $this->argument('tenant_id') ?? 1;
        $year = $this->option('year');

        $this->info("=== Stock Calculation Debug for Product ID: {$productId} ===\n");

        // Get product details
        $product = DB::table('products')->where('id', $productId)->first();
        if (!$product) {
            $this->error("Product not found!");
            return 1;
        }

        $this->info("Product: {$product->name} ({$product->code})");
        $this->line("");

        // Get all stock entries
        $entries = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->orderBy('entry_date')
            ->orderBy('created_at')
            ->get(['entry_date', 'type', 'quantity', 'purchase_price', 'notes']);

        $this->info("Total Stock Entries: " . $entries->count());
        $this->line("");

        // Calculate for September
        $this->line("=== SEPTEMBER {$year} REPORT ===");
        $beforeSep = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->where('entry_date', '<', "{$year}-09-01")
            ->sum('quantity');

        $sepPurchase = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->whereBetween('entry_date', ["{$year}-09-01", "{$year}-09-30"])
            ->where('quantity', '>', 0)
            ->sum('quantity');

        $sepSale = abs(DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->whereBetween('entry_date', ["{$year}-09-01", "{$year}-09-30"])
            ->where('quantity', '<', 0)
            ->sum('quantity'));

        $sepAvailable = $beforeSep + $sepPurchase - $sepSale;

        $this->table(['Item', 'Value'], [
            ['Before Stock', number_format($beforeSep, 2)],
            ['Purchase', number_format($sepPurchase, 2)],
            ['Sale', number_format($sepSale, 2)],
            ['Available', number_format($sepAvailable, 2)],
        ]);
        $this->line("");

        // Calculate for October
        $this->line("=== OCTOBER {$year} REPORT ===");
        $beforeOct = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->where('entry_date', '<', "{$year}-10-01")
            ->sum('quantity');

        $octPurchase = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->whereBetween('entry_date', ["{$year}-10-01", "{$year}-10-31"])
            ->where('quantity', '>', 0)
            ->sum('quantity');

        $octSale = abs(DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->whereBetween('entry_date', ["{$year}-10-01", "{$year}-10-31"])
            ->where('quantity', '<', 0)
            ->sum('quantity'));

        $octAvailable = $beforeOct + $octPurchase - $octSale;

        $this->table(['Item', 'Value'], [
            ['Before Stock', number_format($beforeOct, 2)],
            ['Purchase', number_format($octPurchase, 2)],
            ['Sale', number_format($octSale, 2)],
            ['Available', number_format($octAvailable, 2)],
        ]);

        if ($beforeOct != $sepAvailable) {
            $this->warn("⚠️  MISMATCH: Oct Before ({$beforeOct}) != Sep Available ({$sepAvailable})");
        } else {
            $this->info("✓ Oct Before Stock matches Sep Available Stock");
        }
        $this->line("");

        // Calculate for November
        $this->line("=== NOVEMBER {$year} REPORT ===");
        $beforeNov = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->where('entry_date', '<', "{$year}-11-01")
            ->sum('quantity');

        $novPurchase = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->whereBetween('entry_date', ["{$year}-11-01", "{$year}-11-30"])
            ->where('quantity', '>', 0)
            ->sum('quantity');

        $novSale = abs(DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->whereBetween('entry_date', ["{$year}-11-01", "{$year}-11-30"])
            ->where('quantity', '<', 0)
            ->sum('quantity'));

        $novAvailable = $beforeNov + $novPurchase - $novSale;

        $this->table(['Item', 'Value'], [
            ['Before Stock', number_format($beforeNov, 2)],
            ['Purchase', number_format($novPurchase, 2)],
            ['Sale', number_format($novSale, 2)],
            ['Available', number_format($novAvailable, 2)],
        ]);

        if ($beforeNov != $octAvailable) {
            $this->warn("⚠️  MISMATCH: Nov Before ({$beforeNov}) != Oct Available ({$octAvailable})");
        } else {
            $this->info("✓ Nov Before Stock matches Oct Available Stock");
        }
        $this->line("");

        // Check current stock summary
        $summary = DB::table('stock_summary')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->first();

        if ($summary) {
            $this->line("=== CURRENT STOCK SUMMARY ===");
            $this->table(['Field', 'Value'], [
                ['Total Qty', number_format($summary->total_qty, 2)],
                ['Avg Purchase Price', number_format($summary->avg_purchase_price, 2)],
                ['Total Value', number_format($summary->total_value, 2)],
            ]);

            if ($summary->total_qty != $novAvailable) {
                $this->warn("⚠️  MISMATCH: Stock Summary ({$summary->total_qty}) != Calculated Nov Available ({$novAvailable})");
            }
        }

        // Show recent entries
        $this->line("\n=== RECENT STOCK ENTRIES (Last 10) ===");
        $recent = DB::table('stock_entries')
            ->where('product_id', $productId)
            ->where('tenant_id', $tenantId)
            ->orderBy('entry_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['entry_date', 'type', 'quantity', 'notes']);

        $tableData = [];
        foreach ($recent as $entry) {
            $tableData[] = [
                $entry->entry_date,
                $entry->type,
                number_format($entry->quantity, 2),
                substr($entry->notes ?? '', 0, 40),
            ];
        }
        $this->table(['Date', 'Type', 'Qty', 'Notes'], $tableData);

        return 0;
    }
}
