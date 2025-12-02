<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ReceiptPaymentController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $startDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        $tenantId = Auth::user()->tenant_id;

        // Get opening balance (balance at the start of the period)
        $openingBalance = $this->getOpeningBalance($tenantId, $startDate);

        // Receipt Side
        $receipts = $this->getReceipts($tenantId, $startDate, $endDate, $openingBalance);

        // Payment Side
        $payments = $this->getPayments($tenantId, $startDate, $endDate, $openingBalance);

        return Inertia::render('Reports/ReceiptPayment', [
            'receipts' => $receipts,
            'payments' => $payments,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
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

        return $lastTransaction ? (float)$lastTransaction->balance_after : 0;
    }

    private function getReceipts(int $tenantId, Carbon $startDate, Carbon $endDate, float $openingBalance): array
    {
        // Opening Cash on Bank (from previous period)
        $openingCash = $openingBalance;

        // Sale Collection (credit transactions with category 'sale')
        $saleCollection = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->where('category', 'sale')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Customer Payment Collection
        $customerPayments = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->where('category', 'customer_payment')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Other Income (credit transactions excluding sale, customer_payment, opening)
        $otherIncome = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->whereIn('category', ['others_income', 'profit', 'fund_in', 'other'])
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Adjustment/Refund (credit adjustments from purchase/sale updates)
        $adjustmentRefund = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->where('category', 'adjustment')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Fund Receive (opening balance adjustments or initial capital)
        $fundReceive = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->where('category', 'opening')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        $totalReceipts = $openingCash + $saleCollection + $customerPayments + $otherIncome + $adjustmentRefund + $fundReceive;

        return [
            'opening_cash' => (float)$openingCash,
            'sale_collection' => (float)$saleCollection,
            'customer_payments' => (float)$customerPayments,
            'other_income' => (float)$otherIncome,
            'adjustment_refund' => (float)$adjustmentRefund,
            'fund_receive' => (float)$fundReceive,
            'total' => (float)$totalReceipts,
        ];
    }

    private function getPayments(int $tenantId, Carbon $startDate, Carbon $endDate, float $openingBalance): array
    {
        // Purchase (debit transactions with category 'purchase')
        $purchase = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->where('category', 'purchase')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Vendor Payments
        $vendorPayments = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->where('category', 'vendor_payment')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Expenses
        $expenses = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->where('category', 'expense')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Fixed Asset Purchases
        $fixedAssetPurchases = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->where('category', 'fixed_asset')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Other Payments (adjustments, etc.)
        $otherPayments = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->whereIn('category', ['other', 'adjustment'])
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        // Calculate closing cash - get the final balance at end date
        $closingBalance = BankTransaction::where('tenant_id', $tenantId)
            ->where('transaction_date', '<=', $endDate->toDateString())
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->value('balance_after') ?? $openingBalance;

        $totalPayments = $purchase + $vendorPayments + $expenses + $fixedAssetPurchases + $otherPayments + $closingBalance;

        return [
            'purchase' => (float)$purchase,
            'vendor_payments' => (float)$vendorPayments,
            'expenses' => (float)$expenses,
            'fixed_asset_purchases' => (float)$fixedAssetPurchases,
            'other_payments' => (float)$otherPayments,
            'closing_cash' => (float)$closingBalance,
            'total' => (float)$totalPayments,
        ];
    }

    public function export(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $startDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        $tenantId = Auth::user()->tenant_id;

        // Get tenant information
        $tenant = \App\Models\Tenant::find($tenantId);

        // Get opening balance
        $openingBalance = $this->getOpeningBalance($tenantId, $startDate);

        // Get receipts and payments data
        $receipts = $this->getReceipts($tenantId, $startDate, $endDate, $openingBalance);
        $payments = $this->getPayments($tenantId, $startDate, $endDate, $openingBalance);

        // Generate PDF using dompdf
        $pdf = Pdf::loadView('reports.receipt-payment-pdf', [
            'receipts' => $receipts,
            'payments' => $payments,
            'start_date' => $startDate->format('d M Y'),
            'end_date' => $endDate->format('d M Y'),
            'tenant' => $tenant,
        ]);

        return $pdf->stream('receipt-payment-report-' . $startDate->format('Y-m-d') . '-to-' . $endDate->format('Y-m-d') . '.pdf');
    }
}
