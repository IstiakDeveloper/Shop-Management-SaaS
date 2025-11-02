import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, TrendingUp, TrendingDown, Printer, Download } from 'lucide-react';

interface AccountData {
    account: {
        id: number;
        name: string;
        code: string;
    };
    amount: number;
}

interface Props {
    income_data: AccountData[];
    expense_data: AccountData[];
    total_income: number;
    total_expenses: number;
    net_income: number;
    start_date: string;
    end_date: string;
}

const ProfitAndLoss: React.FC<Props> = ({
    income_data,
    expense_data,
    total_income,
    total_expenses,
    net_income,
    start_date,
    end_date,
}) => {
    const [startDate, setStartDate] = useState(start_date);
    const [endDate, setEndDate] = useState(end_date);

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const handleFilter = () => {
        window.location.href = `/reports/profit-and-loss?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <AppLayout>
            <Head title="Profit & Loss Statement" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Profit & Loss Statement</h1>
                        <p className="text-gray-600 mt-1">
                            {new Date(start_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {' to '}
                            {new Date(end_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
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

                {/* Date Filter */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {/* Income Section */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span>Revenue</span>
                        </h2>
                        <div className="space-y-2">
                            {income_data.length > 0 ? (
                                income_data.map((item) => (
                                    <div key={item.account.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.account.name}</p>
                                            <p className="text-xs text-gray-500">{item.account.code}</p>
                                        </div>
                                        <p className="text-green-600 font-medium">{formatCurrency(item.amount)}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No income recorded</p>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <p className="font-bold text-gray-900">Total Revenue</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(total_income)}</p>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            <span>Expenses</span>
                        </h2>
                        <div className="space-y-2">
                            {expense_data.length > 0 ? (
                                expense_data.map((item) => (
                                    <div key={item.account.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.account.name}</p>
                                            <p className="text-xs text-gray-500">{item.account.code}</p>
                                        </div>
                                        <p className="text-red-600 font-medium">{formatCurrency(item.amount)}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No expenses recorded</p>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <p className="font-bold text-gray-900">Total Expenses</p>
                            <p className="text-xl font-bold text-red-600">{formatCurrency(total_expenses)}</p>
                        </div>
                    </div>

                    {/* Net Income */}
                    <div className={`p-6 ${net_income >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {net_income >= 0 ? 'Net Profit' : 'Net Loss'}
                            </h2>
                            <p className={`text-3xl font-bold ${net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(Math.abs(net_income))}
                            </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {net_income >= 0
                                ? 'Your business generated profit during this period'
                                : 'Your business incurred loss during this period'}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProfitAndLoss;
