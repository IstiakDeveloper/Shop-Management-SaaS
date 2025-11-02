import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowDownUp,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    X,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';

interface BankTransaction {
    id: number;
    type: 'credit' | 'debit';
    category: string;
    amount: number;
    balance_after: number;
    transaction_date: string;
    description: string;
    reference_id: number | null;
    reference_type: string | null;
    created_by: { id: number; name: string };
}

interface Props {
    transactions: {
        data: BankTransaction[];
        links: any[];
        total: number;
    };
    bank_balance: number;
    filters: { search?: string; type?: string; category?: string; start_date?: string; end_date?: string };
    transaction_types: string[];
    categories: string[];
}

const BankTransactionsIndex: React.FC<Props> = ({ transactions, bank_balance, filters, transaction_types, categories }) => {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/bank-transactions', {
            search,
            type,
            category,
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setType('');
        setCategory('');
        setStartDate('');
        setEndDate('');
        router.get('/bank-transactions');
    };

    const deleteTransaction = (id: number, description: string, referenceType: string | null) => {
        if (referenceType) {
            alert('Cannot delete system-generated transactions from sales/purchases');
            return;
        }
        if (confirm(`Delete transaction "${description}"?`)) {
            router.delete(`/bank-transactions/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="Bank Transactions" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bank Transactions</h1>
                        <p className="text-gray-600 mt-1">Current Balance: <span className="text-indigo-600 font-bold">{formatCurrency(bank_balance)}</span></p>
                    </div>
                    <Link
                        href="/bank-transactions/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Transaction</span>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
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
                        </div>

                        {showFilters && (
                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="">All Types</option>
                                    {transaction_types.map((t) => (
                                        <option key={t} value={t}>{t.toUpperCase()}</option>
                                    ))}
                                </select>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>
                                    ))}
                                </select>
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

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions?.data?.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(transaction.transaction_date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{transaction.description}</p>
                                            {transaction.reference_type && (
                                                <p className="text-xs text-gray-500">From {transaction.reference_type}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {transaction.type === 'credit' ? (
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                            )}
                                            <span className="text-sm capitalize">{transaction.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                            {transaction.category.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {formatCurrency(transaction.balance_after)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end space-x-2">
                                            <Link href={`/bank-transactions/${transaction.id}`} className="p-2 hover:bg-indigo-50 rounded-lg">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {!transaction.reference_type && (
                                                <>
                                                    <Link href={`/bank-transactions/${transaction.id}/edit`} className="p-2 hover:bg-blue-50 rounded-lg">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => deleteTransaction(transaction.id, transaction.description, transaction.reference_type)} className="p-2 hover:bg-red-50 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
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

export default BankTransactionsIndex;
