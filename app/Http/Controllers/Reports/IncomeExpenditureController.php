<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class IncomeExpenditureController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $startDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        $tenantId = Auth::user()->tenant_id;

        // Income calculation
        $income = $this->calculateIncome($tenantId, $startDate, $endDate);

        // Expenditure calculation
        $expenditure = $this->calculateExpenditure($tenantId, $startDate, $endDate);

        // Calculate net profit
        $netProfit = $income['total'] - $expenditure['total'];

        return Inertia::render('Reports/IncomeExpenditure', [
            'income' => $income,
            'expenditure' => $expenditure,
            'net_profit' => $netProfit,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
        ]);
    }

    private function calculateIncome(int $tenantId, Carbon $startDate, Carbon $endDate): array
    {
        // Get all credit transactions by category
        $incomeCategories = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'credit')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->selectRaw('category, SUM(amount) as total_amount')
            ->groupBy('category')
            ->pluck('total_amount', 'category')
            ->toArray();

        // Map categories to readable names
        $categoryNames = [
            'opening' => 'Opening Balance/Fund',
            'sale' => 'Sales',
            'customer_payment' => 'Customer Payments',
            'other' => 'Other Income',
            'adjustment' => 'Adjustments',
        ];

        $formattedIncome = [];
        $totalIncome = 0;

        foreach ($incomeCategories as $category => $amount) {
            $displayName = $categoryNames[$category] ?? ucfirst(str_replace('_', ' ', $category));
            $formattedIncome[$category] = [
                'name' => $displayName,
                'amount' => (float)$amount
            ];
            $totalIncome += (float)$amount;
        }

        return [
            'categories' => $formattedIncome,
            'total' => $totalIncome,
        ];
    }

    private function calculateExpenditure(int $tenantId, Carbon $startDate, Carbon $endDate): array
    {
        // Get all debit transactions by category
        $expenditureCategories = BankTransaction::where('tenant_id', $tenantId)
            ->where('type', 'debit')
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->selectRaw('category, SUM(amount) as total_amount')
            ->groupBy('category')
            ->pluck('total_amount', 'category')
            ->toArray();

        // Map categories to readable names
        $categoryNames = [
            'purchase' => 'Purchases',
            'vendor_payment' => 'Vendor Payments',
            'expense' => 'General Expenses',
            'fixed_asset' => 'Fixed Asset Purchases',
            'other' => 'Other Expenses',
            'adjustment' => 'Adjustments',
        ];

        $formattedExpenditure = [];
        $totalExpenditure = 0;

        foreach ($expenditureCategories as $category => $amount) {
            $displayName = $categoryNames[$category] ?? ucfirst(str_replace('_', ' ', $category));
            $formattedExpenditure[$category] = [
                'name' => $displayName,
                'amount' => (float)$amount
            ];
            $totalExpenditure += (float)$amount;
        }

        return [
            'categories' => $formattedExpenditure,
            'total' => $totalExpenditure,
        ];
    }

    public function export(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $startDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        $tenantId = Auth::user()->tenant_id;

        // Get data
        $income = $this->calculateIncome($tenantId, $startDate, $endDate);
        $expenditure = $this->calculateExpenditure($tenantId, $startDate, $endDate);

        // Generate PDF
        $pdf = Pdf::loadView('reports.income-expenditure-pdf', [
            'income' => $income,
            'expenditure' => $expenditure,
            'start_date' => $startDate->format('d M Y'),
            'end_date' => $endDate->format('d M Y'),
            'company_name' => 'Shop Management System',
        ]);

        return $pdf->stream('income-expenditure-' . $startDate->format('Y-m-d') . '-to-' . $endDate->format('Y-m-d') . '.pdf');
    }
}
