import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Download } from 'lucide-react';

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

interface Props {
    income: IncomeData;
    expenditure: ExpenditureData;
    net_profit: number;
    start_date: string;
    end_date: string;
}

export default function IncomeExpenditure({ income, expenditure, net_profit, start_date, end_date }: Props) {
    const [startDate, setStartDate] = useState(start_date);
    const [endDate, setEndDate] = useState(end_date);

    const handleFilter = (newStartDate?: string, newEndDate?: string) => {
        const filterStartDate = newStartDate || startDate;
        const filterEndDate = newEndDate || endDate;

        router.get('/reports/income-expenditure', {
            start_date: filterStartDate,
            end_date: filterEndDate,
        });
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        handleFilter(newStartDate, endDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        handleFilter(startDate, newEndDate);
    };

    const handleExport = () => {
        window.open(`/reports/income-expenditure/export?start_date=${startDate}&end_date=${endDate}`);
    };

    const formatCurrency = (amount: number) => {
        return '৳ ' + new Intl.NumberFormat('en-BD', {
            style: 'decimal',
            minimumFractionDigits: 2,
        }).format(amount);
    };

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

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Income Section */}
                    <Card>
                        <CardHeader className="bg-green-50">
                            <CardTitle className="text-green-800">Income</CardTitle>
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
                                    {Object.entries(income.categories).map(([key, category]) => (
                                        <tr key={key} className="border-b">
                                            <td className="px-4 py-3">{category.name}</td>
                                            <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                                {formatCurrency(category.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-green-100 border-t-2 border-green-600">
                                        <td className="px-4 py-4 font-bold text-green-800">Total Income</td>
                                        <td className="px-4 py-4 text-right text-green-800 font-bold text-lg">
                                            {formatCurrency(income.total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Expenditure Section */}
                    <Card>
                        <CardHeader className="bg-red-50">
                            <CardTitle className="text-red-800">Expenditure</CardTitle>
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
                                    {Object.entries(expenditure.categories).map(([key, category]) => (
                                        <tr key={key} className="border-b">
                                            <td className="px-4 py-3">{category.name}</td>
                                            <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                                {formatCurrency(category.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-red-100 border-t-2 border-red-600">
                                        <td className="px-4 py-4 font-bold text-red-800">Total Expenditure</td>
                                        <td className="px-4 py-4 text-right text-red-800 font-bold text-lg">
                                            {formatCurrency(expenditure.total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Net Profit/Loss Summary */}
                <Card>
                    <CardHeader className={`${net_profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <CardTitle className={`${net_profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                            Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-4 py-3 font-semibold">Total Income</td>
                                    <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                        {formatCurrency(income.total)}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-4 py-3 font-semibold">Total Expenditure</td>
                                    <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                        {formatCurrency(expenditure.total)}
                                    </td>
                                </tr>
                                <tr className={`${net_profit >= 0 ? 'bg-green-100 border-green-600' : 'bg-red-100 border-red-600'} border-t-2`}>
                                    <td className={`px-4 py-4 font-bold ${net_profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                        {net_profit >= 0 ? 'Net Profit' : 'Net Loss'}
                                    </td>
                                    <td className={`px-4 py-4 text-right font-bold text-lg ${net_profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                        {formatCurrency(Math.abs(net_profit))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
