import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface Assets {
    bank_balance: number;
    customer_due: number;
    fixed_assets: number;
    stock_value: number;
    total: number;
}

interface Liabilities {
    fund: number;
    profit: number;
    net_profit: number;
    total: number;
}

interface Props {
    assets: Assets;
    liabilities: Liabilities;
    year: number;
    month: number;
    month_name: string;
    end_date: string;
}

const BalanceSheet: React.FC<Props> = ({
    assets,
    liabilities,
    year,
    month,
    month_name,
    end_date,
}) => {
    const [currentYear, setCurrentYear] = useState(year);
    const [currentMonth, setCurrentMonth] = useState(month);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    const isBalanced = Math.abs(assets.total - liabilities.total) < 0.01;
    const difference = Math.abs(assets.total - liabilities.total);

    return (
        <AppLayout>
            <Head title="Balance Sheet" />

            <div className="max-w-7xl mx-auto space-y-6">
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

                {/* Balance Sheet Tables - Side by Side */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Fund & Liabilities */}
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="bg-gray-50 px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Fund & Liabilities</h2>
                        </div>
                        <div className="p-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 font-semibold">Description</th>
                                        <th className="text-right py-3 font-semibold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-3">Fund</td>
                                        <td className="py-3 text-right text-green-600 font-medium">
                                            {formatCurrency(liabilities.fund)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3">Profit</td>
                                        <td className={`py-3 text-right font-medium ${(liabilities.profit + liabilities.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(liabilities.profit + liabilities.net_profit)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3">&nbsp;</td>
                                        <td className="py-3 text-right">&nbsp;</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3">&nbsp;</td>
                                        <td className="py-3 text-right">&nbsp;</td>
                                    </tr>
                                    <tr className="border-t-2 border-gray-800">
                                        <td className="py-3 font-bold">Total</td>
                                        <td className="py-3 text-right font-bold text-lg">
                                            {formatCurrency(liabilities.total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Property & Assets */}
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="bg-gray-50 px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Property & Assets</h2>
                        </div>
                        <div className="p-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 font-semibold">Description</th>
                                        <th className="text-right py-3 font-semibold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-3">Bank Balance</td>
                                        <td className="py-3 text-right text-blue-600 font-medium">
                                            {formatCurrency(assets.bank_balance)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3">Customer Due</td>
                                        <td className="py-3 text-right text-blue-600 font-medium">
                                            {formatCurrency(assets.customer_due)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3">Fixed Assets</td>
                                        <td className="py-3 text-right text-blue-600 font-medium">
                                            {formatCurrency(assets.fixed_assets)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3">Stock Value</td>
                                        <td className="py-3 text-right text-blue-600 font-medium">
                                            {formatCurrency(assets.stock_value)}
                                        </td>
                                    </tr>
                                    <tr className="border-t-2 border-gray-800">
                                        <td className="py-3 font-bold">Total</td>
                                        <td className="py-3 text-right font-bold text-lg">
                                            {formatCurrency(assets.total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
                                    ✅ Assets equal Liabilities - Balance sheet is balanced!
                                </p>
                            ) : (
                                <p className="text-yellow-600 font-medium mt-1">
                                    ⚠️ Assets do not equal Liabilities - Difference: {formatCurrency(difference)}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Difference</p>
                            <p className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-yellow-600'}`}>
                                {formatCurrency(difference)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default BalanceSheet;
