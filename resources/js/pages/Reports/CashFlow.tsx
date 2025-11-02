import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, DollarSign, Printer, TrendingUp, TrendingDown } from 'lucide-react';

interface CashFlowItem {
    description: string;
    amount: number;
}

interface Props {
    operating_activities: CashFlowItem[];
    investing_activities: CashFlowItem[];
    financing_activities: CashFlowItem[];
    net_operating_cash: number;
    net_investing_cash: number;
    net_financing_cash: number;
    net_change_in_cash: number;
    beginning_cash: number;
    ending_cash: number;
    start_date: string;
    end_date: string;
}

const CashFlow: React.FC<Props> = ({
    operating_activities,
    investing_activities,
    financing_activities,
    net_operating_cash,
    net_investing_cash,
    net_financing_cash,
    net_change_in_cash,
    beginning_cash,
    ending_cash,
    start_date,
    end_date,
}) => {
    const [startDate, setStartDate] = useState(start_date);
    const [endDate, setEndDate] = useState(end_date);

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const handleFilter = () => {
        window.location.href = `/reports/cash-flow?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <AppLayout>
            <Head title="Cash Flow Statement" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Cash Flow Statement</h1>
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

                {/* Operating Activities */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span>Cash from Operating Activities</span>
                    </h2>
                    <div className="space-y-2">
                        {operating_activities.length > 0 ? (
                            operating_activities.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <p className="text-gray-900">{item.description}</p>
                                    <p className={`font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(item.amount)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No operating activities</p>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <p className="font-bold text-gray-900">Net Cash from Operations</p>
                        <p className={`text-xl font-bold ${net_operating_cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(net_operating_cash)}
                        </p>
                    </div>
                </div>

                {/* Investing Activities */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span>Cash from Investing Activities</span>
                    </h2>
                    <div className="space-y-2">
                        {investing_activities.length > 0 ? (
                            investing_activities.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <p className="text-gray-900">{item.description}</p>
                                    <p className={`font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(item.amount)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No investing activities</p>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <p className="font-bold text-gray-900">Net Cash from Investing</p>
                        <p className={`text-xl font-bold ${net_investing_cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(net_investing_cash)}
                        </p>
                    </div>
                </div>

                {/* Financing Activities */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-purple-600" />
                        <span>Cash from Financing Activities</span>
                    </h2>
                    <div className="space-y-2">
                        {financing_activities.length > 0 ? (
                            financing_activities.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <p className="text-gray-900">{item.description}</p>
                                    <p className={`font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(item.amount)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No financing activities</p>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <p className="font-bold text-gray-900">Net Cash from Financing</p>
                        <p className={`text-xl font-bold ${net_financing_cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(net_financing_cash)}
                        </p>
                    </div>
                </div>

                {/* Cash Summary */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/30">
                            <p className="text-sm opacity-90">Net Change in Cash</p>
                            <p className={`text-2xl font-bold ${net_change_in_cash >= 0 ? '' : 'text-red-200'}`}>
                                {formatCurrency(net_change_in_cash)}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm opacity-90">Beginning Cash</p>
                            <p className="text-lg font-medium">{formatCurrency(beginning_cash)}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t-2 border-white/30">
                            <p className="font-bold">Ending Cash</p>
                            <p className="text-3xl font-bold">{formatCurrency(ending_cash)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default CashFlow;
