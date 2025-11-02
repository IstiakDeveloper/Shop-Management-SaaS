<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'tenant_id',
        'account_id',
        'transaction_date',
        'debit',
        'credit',
        'description',
        'type',
        'reference_id',
        'reference_type',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Get the referenced model (sale, purchase, etc.)
    public function reference()
    {
        if ($this->reference_type && $this->reference_id) {
            return $this->morphTo('reference');
        }
        return null;
    }

    // Create journal entry for a sale
    public static function createSaleEntry(Sale $sale): void
    {
        // Debit: Accounts Receivable or Cash
        // Credit: Sales Revenue
        $accountsReceivable = Account::where('tenant_id', $sale->tenant_id)
            ->where('code', '1120')
            ->first();

        $salesRevenue = Account::where('tenant_id', $sale->tenant_id)
            ->where('code', '4100')
            ->first();

        if ($accountsReceivable && $salesRevenue) {
            static::create([
                'tenant_id' => $sale->tenant_id,
                'reference_number' => $sale->invoice_number,
                'transaction_date' => $sale->sale_date,
                'description' => "Sale - {$sale->invoice_number}",
                'debit_account_id' => $accountsReceivable->id,
                'credit_account_id' => $salesRevenue->id,
                'amount' => $sale->total,
                'reference_type' => Sale::class,
                'reference_id' => $sale->id,
            ]);
        }

        // If there's tax, create tax entry
        if ($sale->tax_amount > 0) {
            $taxesPayable = Account::where('tenant_id', $sale->tenant_id)
                ->where('code', '2120')
                ->first();

            if ($taxesPayable) {
                static::create([
                    'tenant_id' => $sale->tenant_id,
                    'reference_number' => $sale->invoice_number . '-TAX',
                    'transaction_date' => $sale->sale_date,
                    'description' => "Sales Tax - {$sale->invoice_number}",
                    'debit_account_id' => $accountsReceivable->id,
                    'credit_account_id' => $taxesPayable->id,
                    'amount' => $sale->tax_amount,
                    'reference_type' => Sale::class,
                    'reference_id' => $sale->id,
                ]);
            }
        }
    }

    // Create journal entry for a purchase
    public static function createPurchaseEntry(Purchase $purchase): void
    {
        // Debit: Inventory or Expense
        // Credit: Accounts Payable
        $inventory = Account::where('tenant_id', $purchase->tenant_id)
            ->where('code', '1130')
            ->first();

        $accountsPayable = Account::where('tenant_id', $purchase->tenant_id)
            ->where('code', '2110')
            ->first();

        if ($inventory && $accountsPayable) {
            static::create([
                'tenant_id' => $purchase->tenant_id,
                'reference_number' => $purchase->invoice_number,
                'transaction_date' => $purchase->purchase_date,
                'description' => "Purchase - {$purchase->invoice_number}",
                'debit_account_id' => $inventory->id,
                'credit_account_id' => $accountsPayable->id,
                'amount' => $purchase->total,
                'reference_type' => Purchase::class,
                'reference_id' => $purchase->id,
            ]);
        }
    }

    // Create payment entry
    public static function createPaymentEntry(
        int $tenantId,
        string $referenceNumber,
        string $date,
        float $amount,
        string $accountCode,
        string $description,
        string $referenceType = null,
        int $referenceId = null
    ): void {
        $cash = Account::where('tenant_id', $tenantId)
            ->where('code', '1110')
            ->first();

        $account = Account::where('tenant_id', $tenantId)
            ->where('code', $accountCode)
            ->first();

        if ($cash && $account) {
            static::create([
                'tenant_id' => $tenantId,
                'reference_number' => $referenceNumber,
                'transaction_date' => $date,
                'description' => $description,
                'debit_account_id' => $cash->id,
                'credit_account_id' => $account->id,
                'amount' => $amount,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
            ]);
        }
    }

    // Scope for transactions in date range
    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    // Scope for transactions by account
    public function scopeByAccount($query, int $accountId)
    {
        return $query->where(function ($q) use ($accountId) {
            $q->where('debit_account_id', $accountId)
              ->orWhere('credit_account_id', $accountId);
        });
    }
}
