import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Download, Filter, X } from 'lucide-react';

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
    const [dateError, setDateError] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);

    // Validate dates whenever they change
    useEffect(() => {
        if (startDate && endDate && startDate > endDate) {
            setDateError('End date must be after start date');
        } else {
            setDateError('');
        }
    }, [startDate, endDate]);

    const handleFilter = () => {
        // Validate dates before filtering
        if (startDate && endDate && startDate > endDate) {
            setDateError('End date must be after start date');
            return;
        }

        setIsFiltering(true);
        router.get('/reports/receipt-payment', {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsFiltering(false),
        });
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setDateError('');

        router.get('/reports/receipt-payment', {
            start_date: '',
            end_date: '',
        });
    };

    // Check if filters are active
    const hasActiveFilters = startDate || endDate;

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
                <Card className="shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg">Filter Options</CardTitle>
                            </div>
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    Filters Active
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="start_date" className="text-sm font-medium">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={`transition-all ${dateError ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="end_date" className="text-sm font-medium">
                                        End Date
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className={`transition-all ${dateError ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {dateError && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md border border-red-200">
                                    <span className="font-medium">⚠</span>
                                    <span>{dateError}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-2 border-t">
                                <Button
                                    onClick={handleFilter}
                                    disabled={!!dateError || isFiltering}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isFiltering ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Filtering...
                                        </>
                                    ) : (
                                        <>
                                            <Filter className="w-4 h-4 mr-2" />
                                            Apply Filters
                                        </>
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button
                                        onClick={handleClearFilters}
                                        variant="outline"
                                        className="border-gray-300 hover:bg-gray-50"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear All
                                    </Button>
                                )}
                                {(startDate || endDate) && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        {startDate && endDate ? (
                                            <>Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</>
                                        ) : startDate ? (
                                            <>From: {new Date(startDate).toLocaleDateString()}</>
                                        ) : (
                                            <>Until: {new Date(endDate).toLocaleDateString()}</>
                                        )}
                                    </span>
                                )}
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
