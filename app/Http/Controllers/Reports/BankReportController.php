<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class BankReportController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $tenantId = Auth::user()->tenant_id;

                // Get the bank account for this tenant - ACTUAL DATABASE NAME
        $bankAccount = Account::getBankAccount($tenantId);
        $accountName = $bankAccount ? $bankAccount->name : 'Main Bank Account';

        // Get opening balance for the month
        $openingBalance = $this->getOpeningBalance($tenantId, $startDate);

        // Get daily transactions for the month
        $dailyTransactions = $this->getDailyTransactions($tenantId, $startDate, $endDate, $openingBalance);

        return Inertia::render('Reports/BankReport', [
            'accountName' => $accountName,
            'openingBalance' => $openingBalance,
            'dailyTransactions' => $dailyTransactions,
            'filters' => [
                'year' => $year,
                'month' => $month,
                'month_name' => $startDate->format('F'),
            ],
        ]);
    }

    private function getOpeningBalance(int $tenantId, Carbon $startDate): float
    {
        // Get the last transaction before the start date
        $lastTransaction = BankTransaction::where('tenant_id', $tenantId)
            ->where('transaction_date', '<', $startDate->toDateString())
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastTransaction) {
            return (float)$lastTransaction->balance_after;
        }

        // If no previous transactions, check if there are any transactions in the selected month
        $firstMonthTransaction = BankTransaction::where('tenant_id', $tenantId)
            ->where('transaction_date', '>=', $startDate->toDateString())
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->first();

        if ($firstMonthTransaction) {
            // Calculate opening balance from the first transaction
            if ($firstMonthTransaction->type === 'credit') {
                return (float)$firstMonthTransaction->balance_after - (float)$firstMonthTransaction->amount;
            } else {
                return (float)$firstMonthTransaction->balance_after + (float)$firstMonthTransaction->amount;
            }
        }

        // If no transactions at all, use account opening balance
        $bankAccount = Account::getBankAccount($tenantId);
        return $bankAccount ? (float)$bankAccount->opening_balance : 0;
    }    private function getDailyTransactions(int $tenantId, Carbon $startDate, Carbon $endDate, float $openingBalance): array
    {
        $dailyData = [];
        $runningBalance = $openingBalance;

        // Month totals for summary row
        $monthTotalDeposits = [
            'fund' => 0,
            'sale_receive' => 0,
            'total' => 0,
        ];

        $monthTotalWithdrawals = [
            'purchase' => 0,
            'vendor_payment' => 0,
            'expense' => 0,
            'total' => 0,
        ];

        // Add Previous Month Balance row (like in your example)
        $dailyData[] = [
            'date' => 'Previous Month Balance',
            'deposit' => [
                'fund' => 0,
                'sale_receive' => 0,
                'total' => 0,
            ],
            'withdrawal' => [
                'purchase' => 0,
                'vendor_payment' => 0,
                'expense' => 0,
                'total' => 0,
            ],
            'bank_balance' => $openingBalance,
        ];

        // Get all transactions for the period grouped by date
        $transactionsByDate = BankTransaction::where('tenant_id', $tenantId)
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('transaction_date')
            ->orderBy('created_at')
            ->get()
            ->groupBy(function ($transaction) {
                return Carbon::parse($transaction->transaction_date)->toDateString();
            });

        // Create date range and process each day
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dateString = $currentDate->toDateString();
            $transactions = $transactionsByDate->get($dateString, collect());

            // Initialize daily totals
            $deposits = [
                'fund' => 0,         // opening
                'sale_receive' => 0, // sale + customer_payment
                'total' => 0,
            ];

            $withdrawals = [
                'purchase' => 0,       // purchase
                'vendor_payment' => 0, // vendor_payment
                'expense' => 0,        // expense + fixed_asset + adjustment
                'total' => 0,
            ];

            foreach ($transactions as $transaction) {
                $amount = (float)$transaction->amount;

                if ($transaction->type === 'credit') {
                    // Deposits (Money In) - Map to actual categories
                    switch ($transaction->category) {
                        case 'opening':
                            $deposits['fund'] += $amount;
                            break;
                        case 'sale':
                        case 'customer_payment':
                            $deposits['sale_receive'] += $amount;
                            break;
                        case 'adjustment':
                        default:
                            // No 'others' column anymore, add to sale_receive
                            $deposits['sale_receive'] += $amount;
                            break;
                    }
                    $runningBalance += $amount;
                } else if ($transaction->type === 'debit') {
                    // Withdrawals (Money Out) - Map to actual categories
                    switch ($transaction->category) {
                        case 'purchase':
                            $withdrawals['purchase'] += $amount;
                            break;
                        case 'vendor_payment':
                            $withdrawals['vendor_payment'] += $amount;
                            break;
                        case 'expense':
                        case 'fixed_asset':
                        case 'adjustment':
                        default:
                            $withdrawals['expense'] += $amount;
                            break;
                    }
                    $runningBalance -= $amount;
                }
            }

            $deposits['total'] = $deposits['fund'] + $deposits['sale_receive'];
            $withdrawals['total'] = $withdrawals['purchase'] + $withdrawals['vendor_payment'] + $withdrawals['expense'];

            $monthTotalDeposits['fund'] += $deposits['fund'];
            $monthTotalDeposits['sale_receive'] += $deposits['sale_receive'];

            $monthTotalWithdrawals['purchase'] += $withdrawals['purchase'];
            $monthTotalWithdrawals['vendor_payment'] += $withdrawals['vendor_payment'];
            $monthTotalWithdrawals['expense'] += $withdrawals['expense'];

            $dailyData[] = [
                'date' => $currentDate->format('d/m/Y'),
                'deposit' => $deposits,
                'withdrawal' => $withdrawals,
                'bank_balance' => $runningBalance,
            ];

            $currentDate->addDay();
        }

        $monthTotalDeposits['total'] = $monthTotalDeposits['fund'] + $monthTotalDeposits['sale_receive'];
        $monthTotalWithdrawals['total'] = $monthTotalWithdrawals['purchase'] + $monthTotalWithdrawals['vendor_payment'] + $monthTotalWithdrawals['expense'];

        $dailyData[] = [
            'date' => 'Month Total:',
            'deposit' => $monthTotalDeposits,
            'withdrawal' => $monthTotalWithdrawals,
            'bank_balance' => $runningBalance,
        ];

        return $dailyData;
    }    public function downloadPdf(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $year = $validated['year'];
        $month = $validated['month'];

        $bankAccount = Account::getBankAccount($tenantId);
        $accountName = $bankAccount ? $bankAccount->name : 'Main Bank Account';

        $start_date = Carbon::create($year, $month, 1);
        $end_date = $start_date->copy()->endOfMonth();

        $opening_balance = $this->getOpeningBalance($tenantId, $start_date);
        $daily_transactions = $this->getDailyTransactions($tenantId, $start_date, $end_date, $opening_balance);

        $months = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'
        ];

        $data = [
            'account_name' => $accountName,
            'company_name' => 'Shop Management System',
            'year' => $year,
            'month_name' => $months[$month],
            'daily_transactions' => $daily_transactions,
        ];

        $pdf = Pdf::loadView('reports.bank-report-pdf', $data);
        $pdf->setPaper('a4', 'landscape');

        $filename = 'bank-report-' . str_replace(' ', '-', $accountName) . '-' . $months[$month] . '-' . $year . '.pdf';

        return $pdf->stream($filename);
    }

    public function export(Request $request)
    {
        // For now, just redirect to PDF download
        return $this->downloadPdf($request);
    }
}
