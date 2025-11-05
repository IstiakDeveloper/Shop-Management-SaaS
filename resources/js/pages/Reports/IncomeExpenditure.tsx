import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Download, Calendar } from 'lucide-react';

interface IncomeCategory {
    name: string;
    amount: number;
}

interface IncomeData {
    categories: { [key: string]: IncomeCategory };
    total: number;
}

interface ExpenditureCategory {
    name: string;
    amount: number;
}

interface ExpenditureData {
    categories: { [key: string]: ExpenditureCategory };
    total: number;
}

interface PeriodData {
    income: IncomeData;
    expenditure: ExpenditureData;
    net_profit: number;
}

interface Props {
    monthly: PeriodData;
    cumulative: PeriodData;
    selected_month: number;
    selected_year: number;
}

export default function IncomeExpenditure({ monthly, cumulative, selected_month, selected_year }: Props) {
    const [month, setMonth] = useState(selected_month);
    const [year, setYear] = useState(selected_year);

    const handleFilter = () => {
        router.get('/reports/income-expenditure', {
            month: month,
            year: year,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        window.open(`/reports/income-expenditure/export?month=${month}&year=${year}`);
    };

    const formatCurrency = (amount: number) => {
        return '৳ ' + new Intl.NumberFormat('en-BD', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    return (
        <AppLayout>
            <Head title="Income & Expenditure Report" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Income & Expenditure Report</h1>
                    <Button onClick={handleExport} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-lg">Select Period</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Year</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                onClick={handleFilter}
                                className="bg-blue-600 hover:bg-blue-700 px-8"
                            >
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Income & Expenditure Tables - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Income Table */}
                    <Card className="border border-gray-200">
                        <CardHeader className="bg-white border-b py-3">
                            <CardTitle className="text-base font-bold text-gray-800">Income</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Description</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Month</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Cumulative</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(monthly.income.categories).map(([key, category]) => (
                                        <tr key={key} className="border-b hover:bg-gray-50">
                                            <td className="px-3 py-2 text-gray-800">{category.name}</td>
                                            <td className="px-3 py-2 text-right text-green-600">
                                                {formatCurrency(category.amount)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-green-600">
                                                {formatCurrency(cumulative.income.categories[key]?.amount || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-green-50 border-t-2 border-green-600">
                                        <td className="px-3 py-3 font-bold text-gray-800">Total Income</td>
                                        <td className="px-3 py-3 text-right font-bold text-green-700">
                                            {formatCurrency(monthly.income.total)}
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-green-700">
                                            {formatCurrency(cumulative.income.total)}
                                        </td>
                                    </tr>
                                    <tr className="bg-green-100">
                                        <td className="px-3 py-3 font-bold text-gray-800">Surplus</td>
                                        <td className="px-3 py-3 text-right font-bold text-green-700">
                                            {formatCurrency(monthly.income.total - monthly.expenditure.total)}
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-green-700">
                                            {formatCurrency(cumulative.income.total - cumulative.expenditure.total)}
                                        </td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="px-3 py-3 font-bold text-gray-800">Grand Total</td>
                                        <td className="px-3 py-3 text-right font-bold text-red-600">
                                            {formatCurrency(monthly.expenditure.total)}
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-red-600">
                                            {formatCurrency(cumulative.expenditure.total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Expenditure Table */}
                    <Card className="border border-gray-200">
                        <CardHeader className="bg-white border-b py-3">
                            <CardTitle className="text-base font-bold text-gray-800">Expenditure</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Description</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Month</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Cumulative</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(monthly.expenditure.categories).map(([key, category]) => (
                                        <tr key={key} className="border-b hover:bg-gray-50">
                                            <td className="px-3 py-2 text-gray-800">{category.name}</td>
                                            <td className="px-3 py-2 text-right text-red-600">
                                                {formatCurrency(category.amount)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-red-600">
                                                {formatCurrency(cumulative.expenditure.categories[key]?.amount || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-red-50 border-t-2 border-red-600">
                                        <td className="px-3 py-3 font-bold text-gray-800">Total Expenditure</td>
                                        <td className="px-3 py-3 text-right font-bold text-red-700">
                                            {formatCurrency(monthly.expenditure.total)}
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-red-700">
                                            {formatCurrency(cumulative.expenditure.total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </AppLayout>
    );
}
