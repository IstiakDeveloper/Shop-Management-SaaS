<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SalePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Sale $sale): bool
    {
        return $user->tenant_id === $sale->tenant_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Sale $sale): bool
    {
        // User can update if:
        // 1. Same tenant
        // 2. Sale is either pending or completed (not cancelled or returned)
        return $user->tenant_id === $sale->tenant_id
            && in_array($sale->status, ['pending', 'completed']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Sale $sale): bool
    {
        // Only allow deletion if same tenant and status is pending
        return $user->tenant_id === $sale->tenant_id
            && $sale->status === 'pending';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Sale $sale): bool
    {
        return $user->tenant_id === $sale->tenant_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Sale $sale): bool
    {
        return false; // Never allow force delete
    }
}
