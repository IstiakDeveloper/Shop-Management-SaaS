<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixStockEntryDates extends Command
{
    protected $signature = 'stock:fix-dates {--dry-run : Show what would be fixed without making changes}';
    protected $description = 'Fix stock entry dates to match sale/purchase dates';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Running in DRY RUN mode - no changes will be made');
        }

        $this->info('Checking for mismatched stock entry dates...');
        $this->newLine();

        // Fix sales
        $this->info('=== CHECKING SALES ===');
        $mismatchedSales = DB::table('sales')
            ->join('stock_entries', function($join) {
                $join->on('sales.id', '=', 'stock_entries.reference_id')
                     ->where('stock_entries.reference_type', '=', 'sale');
            })
            ->whereRaw('sales.sale_date != stock_entries.entry_date')
            ->select('sales.id as sale_id', 'sales.sale_date', 'sales.invoice_number', 'stock_entries.entry_date as current_entry_date')
            ->distinct()
            ->get();

        if ($mismatchedSales->isEmpty()) {
            $this->info('✓ All sale stock entries have correct dates');
        } else {
            $this->warn("Found {$mismatchedSales->count()} sales with mismatched dates:");

            $tableData = [];
            foreach ($mismatchedSales as $sale) {
                $tableData[] = [
                    $sale->invoice_number,
                    $sale->sale_date,
                    $sale->current_entry_date,
                ];
            }
            $this->table(['Invoice', 'Sale Date', 'Stock Entry Date'], $tableData);

            if (!$dryRun) {
                $this->info('Fixing sale stock entries...');
                $fixed = 0;
                foreach ($mismatchedSales as $sale) {
                    $updated = DB::table('stock_entries')
                        ->where('reference_id', $sale->sale_id)
                        ->where('reference_type', 'sale')
                        ->update(['entry_date' => $sale->sale_date]);
                    $fixed += $updated;
                }
                $this->info("✓ Fixed {$fixed} stock entries for sales");
            }
        }

        $this->newLine();

        // Fix purchases
        $this->info('=== CHECKING PURCHASES ===');
        $mismatchedPurchases = DB::table('purchases')
            ->join('stock_entries', function($join) {
                $join->on('purchases.id', '=', 'stock_entries.reference_id')
                     ->where('stock_entries.reference_type', '=', 'purchase');
            })
            ->whereRaw('purchases.purchase_date != stock_entries.entry_date')
            ->select('purchases.id as purchase_id', 'purchases.purchase_date', 'stock_entries.entry_date as current_entry_date')
            ->distinct()
            ->get();

        if ($mismatchedPurchases->isEmpty()) {
            $this->info('✓ All purchase stock entries have correct dates');
        } else {
            $this->warn("Found {$mismatchedPurchases->count()} purchases with mismatched dates:");

            $tableData = [];
            foreach ($mismatchedPurchases as $purchase) {
                $tableData[] = [
                    "PUR-{$purchase->purchase_id}",
                    $purchase->purchase_date,
                    $purchase->current_entry_date,
                ];
            }
            $this->table(['Purchase', 'Purchase Date', 'Stock Entry Date'], $tableData);

            if (!$dryRun) {
                $this->info('Fixing purchase stock entries...');
                $fixed = 0;
                foreach ($mismatchedPurchases as $purchase) {
                    $updated = DB::table('stock_entries')
                        ->where('reference_id', $purchase->purchase_id)
                        ->where('reference_type', 'purchase')
                        ->update(['entry_date' => $purchase->purchase_date]);
                    $fixed += $updated;
                }
                $this->info("✓ Fixed {$fixed} stock entries for purchases");
            }
        }

        $this->newLine();

        if ($dryRun) {
            $this->info('Dry run complete. Run without --dry-run to apply fixes.');
        } else {
            $this->info('✓ All stock entry dates have been synchronized!');
        }

        return 0;
    }
}
