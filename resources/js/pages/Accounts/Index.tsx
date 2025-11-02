import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Wallet,
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

interface Account {
    id: number;
    name: string;
    type: 'bank' | 'expense' | 'fixed_asset';
    description: string | null;
    is_system: boolean;
    current_balance: number;
}

interface Props {
    accounts: {
        data: Account[];
        links: any[];
        total: number;
    };
    bank_account: Account | null;
    expense_account: Account | null;
    total_fixed_assets: number;
    filters: { search?: string; type?: string };
    account_types: string[];
}

const AccountsIndex: React.FC<Props> = ({ accounts, bank_account, expense_account, total_fixed_assets, filters, account_types }) => {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/accounts', { search, type }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setType('');
        router.get('/accounts');
    };

    const deleteAccount = (id: number, name: string) => {
        if (confirm(`Delete account "${name}"?`)) {
            router.delete(`/accounts/${id}`);
        }
    };

    const getTypeColor = (accountType: string) => {
        const colors: Record<string, string> = {
            bank: 'bg-blue-100 text-blue-700',
            expense: 'bg-orange-100 text-orange-700',
            fixed_asset: 'bg-purple-100 text-purple-700',
        };
        return colors[accountType] || 'bg-gray-100 text-gray-700';
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="Chart of Accounts" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
                        <p className="text-gray-600 mt-1">Bank, Expenses, and Fixed Assets</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/accounts/create"
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Fixed Asset</span>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Bank Balance</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(bank_account?.current_balance || 0)}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(expense_account?.current_balance || 0)}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Fixed Assets</p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(total_fixed_assets)}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
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
                                    placeholder="Search by name or code..."
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
                            {(search || type) && (
                                <button type="button" onClick={clearFilters} className="px-4 py-2 border rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="">All Types</option>
                                    {account_types.map((t) => (
                                        <option key={t} value={t}>{t.replace('_', ' ').charAt(0).toUpperCase() + t.replace('_', ' ').slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </form>
                </div>

                {/* Accounts Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {accounts?.data?.map((account) => (
                                <tr key={account.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{account.name}</p>
                                            {account.description && (
                                                <p className="text-sm text-gray-500 truncate max-w-xs">{account.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(account.type)}`}>
                                            {account.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{formatCurrency(account.current_balance)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${account.is_system ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {account.is_system ? 'System' : 'Custom'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end space-x-2">
                                            <Link href={`/accounts/${account.id}`} className="p-2 hover:bg-indigo-50 rounded-lg">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {!account.is_system && (
                                                <>
                                                    <Link href={`/accounts/${account.id}/edit`} className="p-2 hover:bg-blue-50 rounded-lg">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => deleteAccount(account.id, account.name)} className="p-2 hover:bg-red-50 rounded-lg">
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

                    {accounts?.links && (
                        <div className="px-6 py-4 border-t flex justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {accounts?.data?.length || 0} of {accounts?.total || 0}
                            </div>
                            <div className="flex space-x-2">
                                {accounts?.links?.map((link, i) => (
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

export default AccountsIndex;
