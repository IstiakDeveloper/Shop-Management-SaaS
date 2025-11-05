<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BankTransaction;
use App\Models\Account;

class RecalculateBankBalances extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bank:recalculate-balances {--tenant=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate all bank transaction balances in chronological order';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->option('tenant');

        if ($tenantId) {
            $this->recalculateForTenant((int)$tenantId);
        } else {
            // Get all tenants with transactions
            $tenantIds = BankTransaction::distinct()->pluck('tenant_id');

            foreach ($tenantIds as $tid) {
                $this->recalculateForTenant($tid);
            }
        }

        $this->info('Bank balances recalculated successfully!');

        return 0;
    }

    private function recalculateForTenant(int $tenantId): void
    {
        $this->info("Recalculating balances for tenant #{$tenantId}...");

        // Get all transactions in chronological order
        $transactions = BankTransaction::where('tenant_id', $tenantId)
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        if ($transactions->isEmpty()) {
            $this->warn("No transactions found for tenant #{$tenantId}");
            return;
        }

        $runningBalance = 0.0;

        // Recalculate each transaction's balance
        foreach ($transactions as $transaction) {
            if ($transaction->type === 'credit') {
                $runningBalance += (float)$transaction->amount;
            } else {
                $runningBalance -= (float)$transaction->amount;
            }

            $transaction->update(['balance_after' => $runningBalance]);
        }

        // Update bank account current balance
        $bankAccount = Account::getBankAccount($tenantId);
        if ($bankAccount) {
            $bankAccount->update(['current_balance' => $runningBalance]);
            $this->info("Updated bank account current balance to: {$runningBalance}");
        }

        $this->info("Processed {$transactions->count()} transactions for tenant #{$tenantId}");
    }
}
