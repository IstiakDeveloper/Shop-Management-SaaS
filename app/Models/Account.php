<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'opening_balance',
        'current_balance',
        'is_system',
        'is_active',
        'description',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Get account balance
    public function getBalance(): float
    {
        return (float) $this->current_balance;
    }

    // Add amount (credit for bank, increase for others)
    public function credit(float $amount): void
    {
        $this->increment('current_balance', $amount);
    }

    // Subtract amount (debit for bank, decrease for others)
    public function debit(float $amount): void
    {
        $this->decrement('current_balance', $amount);
    }

    // Scope for active accounts
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for accounts by type
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Scope for system accounts
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    // Get bank account for tenant
    public static function getBankAccount(int $tenantId): ?self
    {
        return static::where('tenant_id', $tenantId)
            ->where('type', 'bank')
            ->where('is_system', true)
            ->first();
    }

    // Get expense account for tenant
    public static function getExpenseAccount(int $tenantId): ?self
    {
        return static::where('tenant_id', $tenantId)
            ->where('type', 'expense')
            ->where('is_system', true)
            ->first();
    }

    // Create default accounts for a tenant
    public static function createDefaultAccounts(int $tenantId): void
    {
        // Main Bank Account (system account)
        static::create([
            'tenant_id' => $tenantId,
            'name' => 'Main Bank Account',
            'type' => 'bank',
            'opening_balance' => 0,
            'current_balance' => 0,
            'is_system' => true,
            'is_active' => true,
            'description' => 'Main bank account for all transactions',
        ]);

        // Built-in Expense Account (system account)
        static::create([
            'tenant_id' => $tenantId,
            'name' => 'Operating Expenses',
            'type' => 'expense',
            'opening_balance' => 0,
            'current_balance' => 0,
            'is_system' => true,
            'is_active' => true,
            'description' => 'All operating expenses',
        ]);
    }
}
