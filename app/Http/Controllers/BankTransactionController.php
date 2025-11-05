<?php

namespace App\Http\Controllers;

use App\Models\BankTransaction;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class BankTransactionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $query = BankTransaction::with(['createdBy'])
            ->where('tenant_id', Auth::user()->tenant_id);

        // Filter by transaction type
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

        // Search functionality
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $transactions = $query->latest('transaction_date')
                             ->latest('created_at')
                             ->paginate(20)
                             ->withQueryString();

        // Get bank account info
        $bankAccount = Account::getBankAccount(Auth::user()->tenant_id);
        $bankBalance = $bankAccount ? $bankAccount->current_balance : 0;

        // Calculate category-wise totals
        $creditCategories = ['opening', 'fund_in', 'profit', 'others_income', 'sale', 'customer_payment'];
        $debitCategories = ['expense', 'fund_out', 'office_maintenance', 'asset', 'purchase', 'vendor_payment'];

        $categorySummary = [];
        foreach (array_merge($creditCategories, $debitCategories) as $cat) {
            $categorySummary[$cat] = BankTransaction::where('tenant_id', Auth::user()->tenant_id)
                ->where('category', $cat)
                ->sum('amount');
        }

        return Inertia::render('BankTransactions/Index', [
            'transactions' => $transactions,
            'bank_balance' => $bankBalance,
            'filters' => $request->only(['search', 'type', 'category', 'start_date', 'end_date']),
            'transaction_types' => ['credit', 'debit'],
            'credit_categories' => $creditCategories,
            'debit_categories' => $debitCategories,
            'category_summary' => $categorySummary,
        ]);
    }

    public function create(): Response
    {
        $bankAccount = Account::getBankAccount(Auth::user()->tenant_id);
        $bankBalance = $bankAccount ? $bankAccount->current_balance : 0;

        return Inertia::render('BankTransactions/Create', [
            'bank_balance' => $bankBalance,
            'transaction_types' => ['credit', 'debit'],
            'credit_categories' => ['opening', 'fund_in', 'profit', 'others_income', 'sale', 'customer_payment'],
            'debit_categories' => ['expense', 'fund_out', 'office_maintenance', 'asset', 'purchase', 'vendor_payment'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:credit,debit',
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'description' => 'required|string|max:255',
        ]);

        try {
            if ($validated['type'] === 'credit') {
                BankTransaction::createCredit(
                    Auth::user()->tenant_id,
                    $validated['amount'],
                    $validated['description'],
                    $validated['category'],
                    null,
                    null,
                    $validated['transaction_date'],
                    Auth::id()
                );
            } else {
                BankTransaction::createDebit(
                    Auth::user()->tenant_id,
                    $validated['amount'],
                    $validated['description'],
                    $validated['category'],
                    null,
                    null,
                    $validated['transaction_date'],
                    Auth::id()
                );
            }

            return redirect()->route('bank-transactions.index')
                ->with('success', 'Bank transaction created successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create transaction: ' . $e->getMessage()]);
        }
    }

    public function show(BankTransaction $bankTransaction): Response
    {
        // Check tenant access
        if ($bankTransaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        $bankTransaction->load(['createdBy']);

        return Inertia::render('BankTransactions/Show', [
            'transaction' => $bankTransaction,
        ]);
    }

    public function destroy(BankTransaction $bankTransaction): RedirectResponse
    {
        // Check tenant access
        if ($bankTransaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Prevent deleting system transactions (from sales/purchases)
        if (in_array($bankTransaction->category, ['sale', 'purchase'])) {
            return back()->withErrors(['error' => 'Cannot delete system transactions. Delete the related sale or purchase instead.']);
        }

        try {
            $bankTransaction->delete();

            return redirect()->route('bank-transactions.index')
                ->with('success', 'Bank transaction deleted successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete transaction: ' . $e->getMessage()]);
        }
    }

    // Expenses page (filtered bank transactions with expense category)
    public function expenses(Request $request): Response
    {
        $query = BankTransaction::where('tenant_id', Auth::user()->tenant_id)
            ->where('category', 'expense')
            ->with(['createdBy']);

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }

        // Search functionality
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $expenses = $query->latest('transaction_date')
                         ->latest('created_at')
                         ->paginate(20)
                         ->withQueryString();

        // Get expense account info
        $expenseAccount = Account::getExpenseAccount(Auth::user()->tenant_id);

        // Calculate totals
        $totalExpenses = BankTransaction::where('tenant_id', Auth::user()->tenant_id)
            ->where('category', 'expense')
            ->sum('amount');

        $monthlyExpenses = BankTransaction::where('tenant_id', Auth::user()->tenant_id)
            ->where('category', 'expense')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        return Inertia::render('Expenses/Index', [
            'transactions' => $expenses,
            'total_expenses' => $totalExpenses,
            'monthly_expenses' => $monthlyExpenses,
            'filters' => $request->only(['search', 'start_date', 'end_date']),
        ]);
    }

    public function expenseShow(BankTransaction $bankTransaction): Response
    {
        // Check tenant access
        if ($bankTransaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // Ensure it's an expense transaction
        if ($bankTransaction->category !== 'expense') {
            abort(404);
        }

        $bankTransaction->load(['createdBy']);

        return Inertia::render('Expenses/Show', [
            'transaction' => $bankTransaction,
        ]);
    }
}
