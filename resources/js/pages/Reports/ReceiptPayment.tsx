import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Download } from 'lucide-react';

interface Receipts {
    opening_cash: number;
    sale_collection: number;
    customer_payments: number;
    other_income: number;
    fund_receive: number;
    total: number;
}

interface Payments {
    purchase: number;
    vendor_payments: number;
    expenses: number;
    fixed_asset_purchases: number;
    other_payments: number;
    closing_cash: number;
    total: number;
}

interface Props {
    receipts: Receipts;
    payments: Payments;
    start_date: string;
    end_date: string;
}

export default function ReceiptPayment({ receipts, payments, start_date, end_date }: Props) {
    const [startDate, setStartDate] = useState(start_date);
    const [endDate, setEndDate] = useState(end_date);

    const handleFilter = (newStartDate?: string, newEndDate?: string) => {
        const filterStartDate = newStartDate || startDate;
        const filterEndDate = newEndDate || endDate;

        router.get('/reports/receipt-payment', {
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
        window.open(`/reports/receipt-payment/export?start_date=${startDate}&end_date=${endDate}`);
    };

    const formatCurrency = (amount: number) => {
        return '৳ ' + new Intl.NumberFormat('en-BD', {
            style: 'decimal',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Receipt & Payment Report" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Receipt & Payment Report</h1>
                    <Button onClick={handleExport} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>

                {/* Filter Section */}
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

                {/* Receipt & Payment Statement */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Receipt Column */}
                    <Card>
                        <CardHeader className="bg-green-50">
                            <CardTitle className="text-green-800">Receipts</CardTitle>
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
                                        <td className="px-4 py-3">Opening Cash</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                            {formatCurrency(receipts.opening_cash)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Sale Collection</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                            {formatCurrency(receipts.sale_collection)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Customer Payments</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                            {formatCurrency(receipts.customer_payments)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Other Income</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                            {formatCurrency(receipts.other_income)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Fund Receive</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                            {formatCurrency(receipts.fund_receive)}
                                        </td>
                                    </tr>
                                    <tr className="bg-green-100 border-t-2 border-green-600">
                                        <td className="px-4 py-4 font-bold text-green-800">Total Receipts</td>
                                        <td className="px-4 py-4 text-right text-green-800 font-bold text-lg">
                                            {formatCurrency(receipts.total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Payment Column */}
                    <Card>
                        <CardHeader className="bg-red-50">
                            <CardTitle className="text-red-800">Payments</CardTitle>
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
                                        <td className="px-4 py-3">Purchase</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                            {formatCurrency(payments.purchase)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Vendor Payments</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                            {formatCurrency(payments.vendor_payments)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Expenses</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                            {formatCurrency(payments.expenses)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Fixed Asset Purchases</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                            {formatCurrency(payments.fixed_asset_purchases)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Other Payments</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                            {formatCurrency(payments.other_payments)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Closing Cash at Bank</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                            {formatCurrency(payments.closing_cash)}
                                        </td>
                                    </tr>
                                    <tr className="bg-red-100 border-t-2 border-red-600">
                                        <td className="px-4 py-4 font-bold text-red-800">Total Payments</td>
                                        <td className="px-4 py-4 text-right text-red-800 font-bold text-lg">
                                            {formatCurrency(payments.total)}
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
