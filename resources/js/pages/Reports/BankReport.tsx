import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Download, FileText } from 'lucide-react';

interface DailyTransaction {
    date: string;
    deposit: {
        fund: number;        // opening category (credit)
        sale_receive: number; // sale category (credit)
        total: number;
    };
    withdrawal: {
        purchase: number;     // purchase + vendor_payment categories (debit)
        vendor_payment: number;
        expense: number;      // expense category (debit)
        total: number;
    };
    bank_balance: number;
}

interface Filters {
    year: number;
    month: number;
    month_name: string;
}

interface Props {
    accountName: string;
    openingBalance: number;
    dailyTransactions: DailyTransaction[];
    filters: Filters;
}

export default function BankReport({ accountName, openingBalance, dailyTransactions, filters }: Props) {
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

    const handleFilter = (newYear?: string, newMonth?: string) => {
        const filterYear = newYear || selectedYear;
        const filterMonth = newMonth || selectedMonth;

        router.get('/reports/bank-report', {
            year: filterYear,
            month: filterMonth,
        });
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = e.target.value;
        setSelectedYear(newYear);
        handleFilter(newYear, selectedMonth);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = e.target.value;
        setSelectedMonth(newMonth);
        handleFilter(selectedYear, newMonth);
    };

    const handleExport = () => {
        router.post('/reports/bank-report/export', {
            year: selectedYear,
            month: selectedMonth,
        });
    };

    const handlePdfDownload = () => {
        // Open PDF in new tab
        const params = new URLSearchParams({
            year: selectedYear,
            month: selectedMonth,
        });
        window.open(`/reports/bank-report/pdf?${params}`, '_blank');
    };

    const formatCurrency = (amount: number) => {
        return '৳' + new Intl.NumberFormat('en-BD', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title={`Bank Report - ${filters.month_name} ${filters.year}`} />

            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Bank Report - {filters.month_name} {filters.year}
                            </h1>
                            <Button
                                onClick={handlePdfDownload}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>

                        {/* Account Selection Area */}
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                                    <option value="mousumi">{accountName}</option>
                                </select>
                            </div>
                            <div>
                                <select className="px-3 py-2 border border-gray-300 rounded-md bg-white" value={selectedMonth} onChange={handleMonthChange}>
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select className="px-3 py-2 border border-gray-300 rounded-md bg-white" value={selectedYear} onChange={handleYearChange}>
                                    {years.map(year => (
                                        <option key={year} value={year.toString()}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bank Report Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">
                                {accountName} - {filters.month_name} {filters.year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto max-w-full">
                                <table className="min-w-full text-sm table-fixed border-collapse">
                                    <colgroup>
                                        <col style={{width: '120px'}} />  {/* Date */}
                                        <col style={{width: '90px'}} />   {/* Opening */}
                                        <col style={{width: '90px'}} />   {/* Sale */}
                                        <col style={{width: '90px'}} />   {/* Deposit Total */}
                                        <col style={{width: '90px'}} />   {/* Purchase */}
                                        <col style={{width: '110px'}} />  {/* Vendor Payment */}
                                        <col style={{width: '90px'}} />   {/* Expense */}
                                        <col style={{width: '90px'}} />   {/* Withdrawal Total */}
                                        <col style={{width: '120px'}} />  {/* Bank Balance */}
                                    </colgroup>
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th rowSpan={2} className="px-4 py-3 text-center border-r">Date</th>
                                            <th colSpan={3} className="px-4 py-3 text-center border-r bg-green-100">
                                                Deposit
                                            </th>
                                            <th colSpan={4} className="px-4 py-3 text-center border-r bg-red-100">
                                                Withdrawal
                                            </th>
                                            <th rowSpan={2} className="px-4 py-3 text-center">Bank Balance</th>
                                        </tr>
                                        <tr>
                                            <th className="px-2 py-2 text-center border-r text-xs">Opening</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">Sale</th>
                                            <th className="px-2 py-2 text-center border-r text-xs bg-green-200">Total</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">Purchase</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">Vendor Payment</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">Expense</th>
                                            <th className="px-2 py-2 text-center border-r text-xs bg-red-200">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyTransactions.map((transaction, index) => {
                                            const isSpecialRow = transaction.date === 'Previous Month Balance' || transaction.date === 'Month Total:';
                                            const rowClass = isSpecialRow
                                                ? "border-b bg-gray-100 font-semibold"
                                                : "border-b hover:bg-gray-50";

                                            return (
                                            <tr key={index} className={rowClass}>
                                                <td className="px-4 py-2 text-center border-r font-medium">
                                                    {transaction.date}
                                                </td>

                                                {/* Deposit columns */}
                                                <td className={`px-2 py-2 text-center border-r ${transaction.deposit.fund > 0 ? 'text-green-600' : ''}`}>
                                                    {transaction.deposit.fund > 0 ? formatCurrency(transaction.deposit.fund) : '৳0.00'}
                                                </td>
                                                <td className={`px-2 py-2 text-center border-r ${transaction.deposit.sale_receive > 0 ? 'text-green-600' : ''}`}>
                                                    {transaction.deposit.sale_receive > 0 ? formatCurrency(transaction.deposit.sale_receive) : '৳0.00'}
                                                </td>
                                                <td className={`px-2 py-2 text-center border-r font-semibold ${transaction.deposit.total > 0 ? 'text-green-600 bg-green-50' : ''}`}>
                                                    {transaction.deposit.total > 0 ? formatCurrency(transaction.deposit.total) : '৳0.00'}
                                                </td>

                                                {/* Withdrawal columns */}
                                                <td className={`px-2 py-2 text-center border-r ${transaction.withdrawal.purchase > 0 ? 'text-red-600' : ''}`}>
                                                    {transaction.withdrawal.purchase > 0 ? formatCurrency(transaction.withdrawal.purchase) : '৳0.00'}
                                                </td>
                                                <td className={`px-2 py-2 text-center border-r ${transaction.withdrawal.vendor_payment > 0 ? 'text-red-600' : ''}`}>
                                                    {transaction.withdrawal.vendor_payment > 0 ? formatCurrency(transaction.withdrawal.vendor_payment) : '৳0.00'}
                                                </td>
                                                <td className={`px-2 py-2 text-center border-r ${transaction.withdrawal.expense > 0 ? 'text-red-600' : ''}`}>
                                                    {transaction.withdrawal.expense > 0 ? formatCurrency(transaction.withdrawal.expense) : '৳0.00'}
                                                </td>
                                                <td className={`px-2 py-2 text-center border-r font-semibold ${transaction.withdrawal.total > 0 ? 'text-red-600 bg-red-50' : ''}`}>
                                                    {transaction.withdrawal.total > 0 ? formatCurrency(transaction.withdrawal.total) : '৳0.00'}
                                                </td>

                                                {/* Bank Balance */}
                                                <td className="px-4 py-2 text-center font-semibold text-blue-600">
                                                    {formatCurrency(transaction.bank_balance)}
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {dailyTransactions.length === 0 && (
                        <Card className="mt-6">
                            <CardContent className="text-center py-8">
                                <p className="text-gray-500">No transactions found for the selected period.</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Debug: Check if transactions exist for {filters.month_name} {filters.year}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {dailyTransactions.length > 0 && dailyTransactions.every(t =>
                        t.deposit.total === 0 && t.withdrawal.total === 0 &&
                        !['Opening Balance', 'Closing Balance'].includes(t.date)
                    ) && (
                        <Card className="mt-6">
                            <CardContent className="text-center py-8">
                                <p className="text-orange-500">All transactions show zero amounts.</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    This might be a data mapping issue. Check logs for debugging info.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
