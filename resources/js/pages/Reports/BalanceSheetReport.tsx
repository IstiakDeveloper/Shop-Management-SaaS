import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Download } from 'lucide-react';

interface Assets {
    bank_balance: number;
    customer_due: number;
    fixed_assets: number;
    stock_value: number;
    total: number;
}

interface Liabilities {
    fund: number;
    net_profit: number;
    total: number;
}

interface Filters {
    year: number;
    month: number;
    month_name: string;
}

interface Props {
    assets: Assets;
    liabilities: Liabilities;
    filters: Filters;
}

export default function BalanceSheetReport({ assets, liabilities, filters }: Props) {
    const [selectedYear, setSelectedYear] = useState(filters.year.toString());
    const [selectedMonth, setSelectedMonth] = useState(filters.month.toString());

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handleFilter = () => {
        router.get('/reports/balance-sheet-report', {
            year: selectedYear,
            month: selectedMonth,
        });
    };

    const handleExport = () => {
        router.post('/reports/balance-sheet-report/export', {
            year: selectedYear,
            month: selectedMonth,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Balance Sheet" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
                        <Button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex gap-4 items-end">
                                <div>
                                    <label className="text-sm font-medium">Year</label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(year => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Month</label>
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map(month => (
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleFilter}>
                                    Apply Filter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance Sheet */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fund & Liabilities Column */}
                        <Card>
                            <CardHeader className="bg-red-50">
                                <CardTitle className="text-red-800">Fund & Liabilities</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left">Description</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold">Fund</td>
                                            <td className="px-4 py-3 text-right text-green-600 font-semibold text-lg">
                                                {formatCurrency(liabilities.fund)}
                                            </td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold">Net Profit</td>
                                            <td className="px-4 py-3 text-right text-green-600 font-semibold text-lg">
                                                {formatCurrency(liabilities.net_profit)}
                                            </td>
                                        </tr>
                                        <tr className="bg-red-100 border-t-2 border-red-600">
                                            <td className="px-4 py-4 font-bold text-red-800 text-lg">Total</td>
                                            <td className="px-4 py-4 text-right text-red-800 font-bold text-xl">
                                                {formatCurrency(liabilities.total)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Property & Assets Column */}
                        <Card>
                            <CardHeader className="bg-green-50">
                                <CardTitle className="text-green-800">Property & Assets</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left">Description</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold">Bank Balance</td>
                                            <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                                                {formatCurrency(assets.bank_balance)}
                                            </td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold">Customer Due</td>
                                            <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                                                {formatCurrency(assets.customer_due)}
                                            </td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold">Fixed Assets</td>
                                            <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                                                {formatCurrency(assets.fixed_assets)}
                                            </td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold">Stock Value</td>
                                            <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                                                {formatCurrency(assets.stock_value)}
                                            </td>
                                        </tr>
                                        <tr className="bg-green-100 border-t-2 border-green-600">
                                            <td className="px-4 py-4 font-bold text-green-800 text-lg">Total</td>
                                            <td className="px-4 py-4 text-right text-green-800 font-bold text-xl">
                                                {formatCurrency(assets.total)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Balance Check */}
                    <Card className="mt-6">
                        <CardContent className="p-4">
                            <div className="flex justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">Balance Verification</p>
                                    {Math.abs(assets.total - liabilities.total) < 0.01 ? (
                                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                                            <p className="font-semibold">✓ Balance Sheet is Balanced</p>
                                            <p className="text-sm">Assets = Liabilities ({formatCurrency(assets.total)})</p>
                                        </div>
                                    ) : (
                                        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                                            <p className="font-semibold">⚠ Balance Sheet is not Balanced</p>
                                            <p className="text-sm">
                                                Difference: {formatCurrency(Math.abs(assets.total - liabilities.total))}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
