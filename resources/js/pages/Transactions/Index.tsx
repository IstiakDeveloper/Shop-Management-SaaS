import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Plus, Search, FileText, Eye, Edit2, Trash2, BookOpen } from 'lucide-react';

interface Account {
    id: number;
    name: string;
    code: string;
}

interface Transaction {
    id: number;
    date: string;
    description: string;
    reference: string | null;
    total_amount: number;
    created_at: string;
    entries: {
        id: number;
        account: Account;
        debit: number;
        credit: number;
    }[];
}

interface Props {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const TransactionIndex: React.FC<Props> = ({ transactions }) => {
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        window.location.href = `/transactions?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        window.location.href = '/transactions';
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            window.location.href = `/transactions/${id}/delete`;
        }
    };

    const totalDebit = transactions.data.reduce((sum, t) => sum + t.total_amount, 0);

    return (
        <AppLayout>
            <Head title="Journal Transactions" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Journal Transactions</h1>
                        <p className="text-gray-600 mt-1">Manage accounting journal entries</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/transactions/journal"
                            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center space-x-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>General Journal</span>
                        </Link>
                        <Link
                            href="/transactions/trial-balance"
                            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center space-x-2"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Trial Balance</span>
                        </Link>
                        <Link
                            href="/transactions/create"
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Entry</span>
                        </Link>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Total Transactions</p>
                            <p className="text-4xl font-bold mt-2">{transactions.total}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium opacity-90">Total Amount</p>
                            <p className="text-3xl font-bold mt-2">{formatCurrency(totalDebit)}</p>
                        </div>
                        <FileText className="w-16 h-16 opacity-20" />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="grid md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Description or reference..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
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
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                            >
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accounts</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(transaction.date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {transaction.reference || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{transaction.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {transaction.entries.length} entries
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {transaction.entries.slice(0, 2).map((entry) => (
                                                        <div key={entry.id} className="text-sm">
                                                            <span className="text-gray-900">{entry.account.name}</span>
                                                            <span className={`ml-2 ${entry.debit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {entry.debit > 0 ? 'Dr.' : 'Cr.'} {formatCurrency(entry.debit || entry.credit)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {transaction.entries.length > 2 && (
                                                        <p className="text-xs text-gray-500">+{transaction.entries.length - 2} more</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                {formatCurrency(transaction.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <Link
                                                        href={`/transactions/${transaction.id}`}
                                                        className="text-indigo-600 hover:text-indigo-700"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/transactions/${transaction.id}/edit`}
                                                        className="text-gray-600 hover:text-gray-700"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                            <p>No transactions found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="px-6 py-4 border-t flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing page {transactions.current_page} of {transactions.last_page}
                            </p>
                            <div className="flex items-center space-x-2">
                                {transactions.current_page > 1 && (
                                    <Link
                                        href={`/transactions?page=${transactions.current_page - 1}`}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {transactions.current_page < transactions.last_page && (
                                    <Link
                                        href={`/transactions?page=${transactions.current_page + 1}`}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default TransactionIndex;
