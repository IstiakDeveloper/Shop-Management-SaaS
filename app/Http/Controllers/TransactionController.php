<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaction::with(['debitAccount', 'creditAccount'])
            ->where('tenant_id', Auth::user()->tenant_id);

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }

        // Filter by account
        if ($request->filled('account_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('debit_account_id', $request->account_id)
                  ->orWhere('credit_account_id', $request->account_id);
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('reference', 'like', '%' . $request->search . '%');
            });
        }

        $transactions = $query->latest('transaction_date')
                             ->latest('created_at')
                             ->paginate(20)
                             ->withQueryString();

        // Get accounts for filters
        $accounts = Account::where('tenant_id', Auth::user()->tenant_id)
                          ->where('is_active', true)
                          ->select('id', 'code', 'name', 'type')
                          ->orderBy('type')
                          ->orderBy('code')
                          ->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'account_id', 'type', 'start_date', 'end_date']),
            'transaction_types' => ['manual', 'sale', 'purchase', 'payment', 'receipt'],
        ]);
    }

    public function create(): Response
    {
        $accounts = Account::where('tenant_id', Auth::user()->tenant_id)
                          ->where('is_active', true)
                          ->select('id', 'code', 'name', 'type')
                          ->orderBy('type')
                          ->orderBy('code')
                          ->get();

        return Inertia::render('Transactions/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'debit_account_id' => 'required|exists:accounts,id',
            'credit_account_id' => 'required|exists:accounts,id|different:debit_account_id',
            'amount' => 'required|numeric|min:0.01|max:999999.99',
            'transaction_date' => 'required|date',
            'description' => 'required|string|max:255',
            'reference' => 'nullable|string|max:100',
        ]);

        // Verify accounts belong to tenant
        $debitAccount = Account::where('id', $validated['debit_account_id'])
                              ->where('tenant_id', Auth::user()->tenant_id)
                              ->first();
        $creditAccount = Account::where('id', $validated['credit_account_id'])
                               ->where('tenant_id', Auth::user()->tenant_id)
                               ->first();

        if (!$debitAccount || !$creditAccount) {
            return back()->withErrors(['accounts' => 'Invalid account selection.']);
        }

        Transaction::create([
            'tenant_id' => Auth::user()->tenant_id,
            'type' => 'manual',
            ...$validated,
        ]);

        return redirect()->route('transactions.index')
                        ->with('message', 'Transaction created successfully.');
    }

    public function show(Transaction $transaction): Response
    {
        $transaction->load(['debitAccount', 'creditAccount']);

        // Check tenant access
        if ($transaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(Transaction $transaction)
    {
        // Check tenant access
        if ($transaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Only allow editing of manual transactions
        if ($transaction->type !== 'manual') {
            return redirect()->route('transactions.show', $transaction)
                            ->withErrors(['transaction' => 'Only manual transactions can be edited.']);
        }

        $accounts = Account::where('tenant_id', Auth::user()->tenant_id)
                          ->where('is_active', true)
                          ->select('id', 'code', 'name', 'type')
                          ->orderBy('type')
                          ->orderBy('code')
                          ->get();

        return Inertia::render('Transactions/Edit', [
            'transaction' => $transaction,
            'accounts' => $accounts,
        ]);
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        // Check tenant access
        if ($transaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Only allow editing of manual transactions
        if ($transaction->type !== 'manual') {
            return back()->withErrors(['transaction' => 'Only manual transactions can be edited.']);
        }

        $validated = $request->validate([
            'debit_account_id' => 'required|exists:accounts,id',
            'credit_account_id' => 'required|exists:accounts,id|different:debit_account_id',
            'amount' => 'required|numeric|min:0.01|max:999999.99',
            'transaction_date' => 'required|date',
            'description' => 'required|string|max:255',
            'reference' => 'nullable|string|max:100',
        ]);

        // Verify accounts belong to tenant
        $debitAccount = Account::where('id', $validated['debit_account_id'])
                              ->where('tenant_id', Auth::user()->tenant_id)
                              ->first();
        $creditAccount = Account::where('id', $validated['credit_account_id'])
                               ->where('tenant_id', Auth::user()->tenant_id)
                               ->first();

        if (!$debitAccount || !$creditAccount) {
            return back()->withErrors(['accounts' => 'Invalid account selection.']);
        }

        $transaction->update($validated);

        return redirect()->route('transactions.index')
                        ->with('message', 'Transaction updated successfully.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        // Check tenant access
        if ($transaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Only allow deletion of manual transactions
        if ($transaction->type !== 'manual') {
            return back()->withErrors(['transaction' => 'Only manual transactions can be deleted.']);
        }

        $transaction->delete();

        return redirect()->route('transactions.index')
                        ->with('message', 'Transaction deleted successfully.');
    }

    // Journal entry view
    public function journal(Request $request): Response
    {
        $query = Transaction::with(['debitAccount', 'creditAccount'])
            ->where('tenant_id', Auth::user()->tenant_id);

        // Filter by date range (default to current month)
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $query->whereBetween('transaction_date', [$startDate, $endDate]);

        $transactions = $query->orderBy('transaction_date')
                             ->orderBy('created_at')
                             ->get();

        return Inertia::render('Transactions/Journal', [
            'transactions' => $transactions,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    // Trial balance report
    public function trialBalance(Request $request): Response
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $accounts = Account::where('tenant_id', Auth::user()->tenant_id)
                          ->where('is_active', true)
                          ->with(['transactions' => function ($query) use ($date) {
                              $query->where('transaction_date', '<=', $date);
                          }])
                          ->orderBy('type')
                          ->orderBy('code')
                          ->get();

        $trialBalance = [];
        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($accounts as $account) {
            $balance = $account->getBalanceForPeriod(null, $date);

            if ($balance != 0) {
                $isDebitBalance = in_array($account->type, ['asset', 'expense']) ? $balance > 0 : $balance < 0;

                $trialBalance[] = [
                    'account' => $account,
                    'debit' => $isDebitBalance ? abs($balance) : 0,
                    'credit' => !$isDebitBalance ? abs($balance) : 0,
                ];

                if ($isDebitBalance) {
                    $totalDebits += abs($balance);
                } else {
                    $totalCredits += abs($balance);
                }
            }
        }

        return Inertia::render('Transactions/TrialBalance', [
            'trial_balance' => $trialBalance,
            'total_debits' => $totalDebits,
            'total_credits' => $totalCredits,
            'date' => $date,
            'is_balanced' => round($totalDebits, 2) === round($totalCredits, 2),
        ]);
    }
}
