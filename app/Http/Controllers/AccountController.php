<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Account::where('tenant_id', Auth::user()->tenant_id);

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by active status
        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $accounts = $query->orderBy('is_system', 'desc')
                         ->orderBy('type')
                         ->orderBy('name')
                         ->paginate(20)
                         ->withQueryString();

        // Get bank account balance
        $bankAccount = Account::getBankAccount(Auth::user()->tenant_id);
        $expenseAccount = Account::getExpenseAccount(Auth::user()->tenant_id);

        // Calculate total fixed assets balance
        $totalFixedAssets = Account::where('tenant_id', Auth::user()->tenant_id)
            ->where('type', 'fixed_asset')
            ->sum('current_balance');

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
            'bank_account' => $bankAccount,
            'expense_account' => $expenseAccount,
            'total_fixed_assets' => $totalFixedAssets,
            'filters' => $request->only(['search', 'type', 'active']),
            'account_types' => ['bank', 'fixed_asset', 'expense'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Accounts/Create', [
            'account_types' => ['fixed_asset'], // Only allow creating fixed assets
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:fixed_asset',
            'description' => 'nullable|string|max:1000',
            'opening_balance' => 'nullable|numeric|min:0',
        ]);

        Account::create([
            'tenant_id' => Auth::user()->tenant_id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'opening_balance' => $validated['opening_balance'] ?? 0,
            'current_balance' => $validated['opening_balance'] ?? 0,
            'is_system' => false,
        ]);

        return redirect()->route('accounts.index')
                        ->with('success', 'Account created successfully.');
    }

    public function show(Account $account): Response
    {
        // Check tenant access
        if ($account->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        return Inertia::render('Accounts/Show', [
            'account' => $account,
        ]);
    }

    public function edit(Account $account): Response|RedirectResponse
    {
        // Check tenant access
        if ($account->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Cannot edit system accounts
        if ($account->is_system) {
            return redirect()->route('accounts.show', $account)
                ->with('error', 'System accounts cannot be edited.');
        }

        return Inertia::render('Accounts/Edit', [
            'account' => $account,
        ]);
    }

    public function update(Request $request, Account $account): RedirectResponse
    {
        // Check tenant access
        if ($account->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Cannot edit system accounts
        if ($account->is_system) {
            return back()->withErrors(['error' => 'System accounts cannot be edited.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $account->update($validated);

        return redirect()->route('accounts.index')
                        ->with('success', 'Account updated successfully.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        // Check tenant access
        if ($account->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Cannot delete system accounts
        if ($account->is_system) {
            return back()->withErrors(['error' => 'System accounts cannot be deleted.']);
        }

        $account->delete();

        return redirect()->route('accounts.index')
                        ->with('success', 'Account deleted successfully.');
    }

    // Bank transactions page
    public function bankTransactions(Request $request): Response
    {
        $bankAccount = Account::getBankAccount(Auth::user()->tenant_id);

        $query = BankTransaction::where('tenant_id', Auth::user()->tenant_id);

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }

        $transactions = $query->with('createdBy')
                             ->latest('transaction_date')
                             ->latest('created_at')
                             ->paginate(20)
                             ->withQueryString();

        return Inertia::render('Accounts/BankTransactions', [
            'bank_account' => $bankAccount,
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'category', 'start_date', 'end_date']),
        ]);
    }
}
