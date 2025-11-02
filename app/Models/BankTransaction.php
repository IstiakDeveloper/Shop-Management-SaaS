<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class BankTransaction extends Model
{
    protected $fillable = [
        'tenant_id',
        'transaction_date',
        'type',
        'category',
        'amount',
        'balance_after',
        'description',
        'reference_id',
        'reference_type',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Create a credit transaction (money in)
    public static function createCredit(
        int $tenantId,
        float $amount,
        string $description,
        string $category = 'sale',
        ?int $referenceId = null,
        ?string $referenceType = null,
        ?string $date = null,
        ?int $createdBy = null
    ): self {
        return DB::transaction(function () use ($tenantId, $amount, $description, $category, $referenceId, $referenceType, $date, $createdBy) {
            $bankAccount = Account::getBankAccount($tenantId);

            if (!$bankAccount) {
                throw new \RuntimeException('Bank account not found for tenant');
            }

            // Calculate balance after transaction
            $balanceAfter = $bankAccount->current_balance + $amount;

            $bankTransaction = self::create([
                'tenant_id' => $tenantId,
                'type' => 'credit',
                'category' => $category,
                'amount' => $amount,
                'balance_after' => $balanceAfter,
                'transaction_date' => $date ?? now()->toDateString(),
                'description' => $description,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
                'created_by' => $createdBy ?? 1,
            ]);

            $bankAccount->credit($amount);

            return $bankTransaction;
        });
    }

    // Create a debit transaction (money out)
    public static function createDebit(
        int $tenantId,
        float $amount,
        string $description,
        string $category = 'purchase',
        ?int $referenceId = null,
        ?string $referenceType = null,
        ?string $date = null,
        ?int $createdBy = null
    ): self {
        return DB::transaction(function () use ($tenantId, $amount, $description, $category, $referenceId, $referenceType, $date, $createdBy) {
            $bankAccount = Account::getBankAccount($tenantId);

            if (!$bankAccount) {
                throw new \RuntimeException('Bank account not found for tenant');
            }

            // Calculate balance after transaction
            $balanceAfter = $bankAccount->current_balance - $amount;

            $bankTransaction = self::create([
                'tenant_id' => $tenantId,
                'type' => 'debit',
                'category' => $category,
                'amount' => $amount,
                'balance_after' => $balanceAfter,
                'transaction_date' => $date ?? now()->toDateString(),
                'description' => $description,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
                'created_by' => $createdBy ?? 1,
            ]);

            $bankAccount->debit($amount);

            return $bankTransaction;
        });
    }

    // Scope for credits
    public function scopeCredits($query)
    {
        return $query->where('type', 'credit');
    }

    // Scope for debits
    public function scopeDebits($query)
    {
        return $query->where('type', 'debit');
    }

    // Scope for date range
    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    // Scope for specific category
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // Get formatted amount with type indicator
    public function getFormattedAmountAttribute(): string
    {
        $prefix = $this->type === 'credit' ? '+' : '-';
        return $prefix . number_format((float)$this->amount, 2);
    }
}
