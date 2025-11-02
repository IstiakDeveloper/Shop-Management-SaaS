import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, BarChart3, Printer, Download } from 'lucide-react';

interface CurrentAssets {
    cash_at_bank: number;
    stock_value: number;
    customer_due: number;
    total: number;
}

interface FixedAsset {
    name: string;
    value: number;
}

interface FixedAssets {
    items: FixedAsset[];
    total: number;
}

interface Assets {
    current_assets: CurrentAssets;
    fixed_assets: FixedAssets;
    total_assets: number;
}

interface Liabilities {
    accounts_payable: number;
    total: number;
}

interface Equity {
    opening_capital: number;
    net_profit: number;
    total: number;
}

interface LiabilitiesEquity {
    liabilities: Liabilities;
    equity: Equity;
    total_liabilities_equity: number;
    calculations?: {
        total_sales: number;
        total_purchases: number;
        total_expenses: number;
        vendor_payments: number;
    };
}

interface Props {
    assets: Assets;
    liabilities_equity: LiabilitiesEquity;
    year: number;
    month: number;
    month_name: string;
    end_date: string;
}

const BalanceSheet: React.FC<Props> = ({
    assets,
    liabilities_equity,
    year,
    month,
    month_name,
    end_date,
}) => {
    const [currentYear, setCurrentYear] = useState(year);
    const [currentMonth, setCurrentMonth] = useState(month);

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const handleFilter = (newYear?: number, newMonth?: number) => {
        const filterYear = newYear || currentYear;
        const filterMonth = newMonth || currentMonth;

        router.get('/reports/balance-sheet-report', {
            year: filterYear,
            month: filterMonth,
        });
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value);
        setCurrentYear(newYear);
        handleFilter(newYear, currentMonth);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value);
        setCurrentMonth(newMonth);
        handleFilter(currentYear, newMonth);
    };

    const handleExport = () => {
        window.open(`/reports/balance-sheet-report/export?year=${currentYear}&month=${currentMonth}`, '_blank');
    };

    const isBalanced = Math.abs(assets.total_assets - liabilities_equity.total_liabilities_equity) < 0.01;

    return (
        <AppLayout>
            <Head title="Balance Sheet" />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
                        <p className="text-gray-600 mt-1">
                            As at {month_name} {year}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export PDF</span>
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print</span>
                        </button>
                        <Link
                            href="/reports"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <select
                                value={currentYear}
                                onChange={handleYearChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                            <select
                                value={currentMonth}
                                onChange={handleMonthChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>
                                        {new Date(2025, m - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Assets Side */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <span>Assets</span>
                        </h2>

                        {/* Current Assets */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Assets</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="font-medium text-gray-700">Cash at Bank</span>
                                    <span className="text-blue-600 font-semibold">{formatCurrency(assets.current_assets.cash_at_bank)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="font-medium text-gray-700">Stock/Inventory</span>
                                    <span className="text-blue-600 font-semibold">{formatCurrency(assets.current_assets.stock_value)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="font-medium text-gray-700">Customer Due</span>
                                    <span className="text-blue-600 font-semibold">{formatCurrency(assets.current_assets.customer_due)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 bg-blue-50 px-3 rounded">
                                    <span className="font-semibold text-blue-800">Total Current Assets</span>
                                    <span className="font-semibold text-blue-800">{formatCurrency(assets.current_assets.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Assets */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Fixed Assets</h3>
                            <div className="space-y-3">
                                {assets.fixed_assets.items.map((asset, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b">
                                        <span className="font-medium text-gray-700">{asset.name}</span>
                                        <span className="text-blue-600 font-semibold">{formatCurrency(asset.value)}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-2 bg-blue-50 px-3 rounded">
                                    <span className="font-semibold text-blue-800">Total Fixed Assets</span>
                                    <span className="font-semibold text-blue-800">{formatCurrency(assets.fixed_assets.total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t-2 border-blue-600 bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-blue-800">Total Assets</span>
                                <span className="text-2xl font-bold text-blue-800">{formatCurrency(assets.total_assets)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Liabilities & Equity Side */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            <span>Liabilities & Equity</span>
                        </h2>

                        {/* Liabilities */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Liabilities</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="font-medium text-gray-700">Accounts Payable</span>
                                    <span className="text-red-600 font-semibold">{formatCurrency(liabilities_equity.liabilities.accounts_payable)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 bg-red-50 px-3 rounded">
                                    <span className="font-semibold text-red-800">Total Liabilities</span>
                                    <span className="font-semibold text-red-800">{formatCurrency(liabilities_equity.liabilities.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Equity */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Equity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="font-medium text-gray-700">Opening Capital</span>
                                    <span className="text-purple-600 font-semibold">{formatCurrency(liabilities_equity.equity.opening_capital)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="font-medium text-gray-700">Net Profit</span>
                                    <span className={`font-semibold ${liabilities_equity.equity.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(liabilities_equity.equity.net_profit)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 bg-purple-50 px-3 rounded">
                                    <span className="font-semibold text-purple-800">Total Equity</span>
                                    <span className="font-semibold text-purple-800">{formatCurrency(liabilities_equity.equity.total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t-2 border-purple-600 bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-purple-800">Total Liabilities & Equity</span>
                                <span className="text-2xl font-bold text-purple-800">{formatCurrency(liabilities_equity.total_liabilities_equity)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Check */}
                <div className={`p-6 rounded-xl ${isBalanced ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`text-xl font-bold ${isBalanced ? 'text-green-800' : 'text-yellow-800'}`}>
                                Balance Sheet Status
                            </h3>
                            {isBalanced ? (
                                <p className="text-green-600 font-medium mt-1">
                                    ✅ Assets equal Liabilities & Equity - Balance sheet is balanced!
                                </p>
                            ) : (
                                <p className="text-yellow-600 font-medium mt-1">
                                    ⚠️ Assets do not equal Liabilities & Equity - Difference: {formatCurrency(Math.abs(assets.total_assets - liabilities_equity.total_liabilities_equity))}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Difference</p>
                            <p className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-yellow-600'}`}>
                                {formatCurrency(Math.abs(assets.total_assets - liabilities_equity.total_liabilities_equity))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default BalanceSheet;
