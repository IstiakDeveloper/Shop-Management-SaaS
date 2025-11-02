import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DollarSign, Search, Filter, Eye, X, Calendar } from 'lucide-react';

interface Transaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    transaction_date: string;
    balance_after: number;
    created_by: { id: number; name: string };
}

interface Props {
    transactions: {
        data: Transaction[];
        links: any[];
        total: number;
    };
    total_expenses: number;
    monthly_expenses: number;
    filters: { search?: string; start_date?: string; end_date?: string };
}

const ExpensesIndex: React.FC<Props> = ({ transactions, total_expenses, monthly_expenses, filters }) => {
    const [search, setSearch] = useState(filters?.search || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/expenses', {
            search,
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        router.get('/expenses');
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="Expenses" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                        <p className="text-gray-600 mt-1">Track all your business expenses</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(total_expenses)}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">This Month</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(monthly_expenses)}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                                Search
                            </button>
                            {(search || startDate || endDate) && (
                                <button type="button" onClick={clearFilters} className="px-4 py-2 border rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                    placeholder="End Date"
                                />
                            </div>
                        )}
                    </form>
                </div>

                {/* Expenses Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions?.data?.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(transaction.transaction_date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4">{transaction.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                            {transaction.category.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-orange-600">
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{transaction.created_by.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end space-x-2">
                                            <Link href={`/expenses/${transaction.id}`} className="p-2 hover:bg-indigo-50 rounded-lg">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {transactions?.links && (
                        <div className="px-6 py-4 border-t flex justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {transactions?.data?.length || 0} of {transactions?.total || 0}
                            </div>
                            <div className="flex space-x-2">
                                {transactions?.links?.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default ExpensesIndex;
