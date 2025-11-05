<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanDuplicateStockEntries extends Command
{
    protected $signature = 'stock:clean-duplicates {--dry-run : Show what would be deleted without making changes}';
    protected $description = 'Remove duplicate stock entries for same reference';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Running in DRY RUN mode - no changes will be made');
        }

        $this->info('Searching for duplicate stock entries...');
        $this->newLine();

        // Find duplicates
        $duplicates = DB::table('stock_entries')
            ->select('reference_id', 'reference_type', 'product_id', DB::raw('COUNT(*) as count'))
            ->whereNotNull('reference_id')
            ->whereIn('reference_type', ['sale', 'purchase'])
            ->groupBy('reference_id', 'reference_type', 'product_id')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('✓ No duplicate stock entries found');
            return 0;
        }

        $this->warn("Found {$duplicates->count()} products with duplicate entries");
        $this->newLine();

        $totalDeleted = 0;

        foreach ($duplicates as $dup) {
            $this->info("Processing: {$dup->reference_type} #{$dup->reference_id} - Product #{$dup->product_id}");

            // Get all entries for this reference, ordered by created_at
            $entries = DB::table('stock_entries')
                ->where('reference_id', $dup->reference_id)
                ->where('reference_type', $dup->reference_type)
                ->where('product_id', $dup->product_id)
                ->orderBy('created_at')
                ->get(['id', 'quantity', 'entry_date', 'created_at']);

            // Display all entries
            $tableData = [];
            foreach ($entries as $index => $entry) {
                $action = $index === 0 ? 'KEEP' : 'DELETE';
                $tableData[] = [
                    $entry->id,
                    $entry->quantity,
                    $entry->entry_date,
                    $entry->created_at,
                    $action,
                ];
            }
            $this->table(['ID', 'Qty', 'Entry Date', 'Created At', 'Action'], $tableData);

            // Delete all except the first one (oldest)
            if (!$dryRun) {
                $idsToDelete = $entries->skip(1)->pluck('id')->toArray();
                $deleted = DB::table('stock_entries')
                    ->whereIn('id', $idsToDelete)
                    ->delete();

                $totalDeleted += $deleted;
                $this->info("✓ Deleted {$deleted} duplicate entries");
            }

            $this->newLine();
        }

        if ($dryRun) {
            $this->info('Dry run complete. Run without --dry-run to delete duplicates.');
        } else {
            $this->info("✓ Cleanup complete! Deleted {$totalDeleted} duplicate entries");
            $this->newLine();
            $this->warn('⚠️  IMPORTANT: Run stock:recalculate to update stock summaries');
        }

        return 0;
    }
}
