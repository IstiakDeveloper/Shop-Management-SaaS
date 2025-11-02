import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Edit2, Wallet, Calendar } from 'lucide-react';

interface Account {
    id: number;
    name: string;
    type: string;
    description: string | null;
    is_system: boolean;
    current_balance: number;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    transaction_date: string;
}

interface Props {
    account: Account;
    transactions: Transaction[];
}

const AccountShow: React.FC<Props> = ({ account, transactions }) => {
    const formatCurrency = (amount: number) => {
        return `৳${Math.abs(amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getTypeColor = (accountType: string) => {
        const colors: Record<string, string> = {
            bank: 'bg-blue-100 text-blue-700',
            expense: 'bg-orange-100 text-orange-700',
            fixed_asset: 'bg-purple-100 text-purple-700',
        };
        return colors[accountType] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppLayout>
            <Head title={account.name} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(account.type)}`}>
                                {account.type.replace('_', ' ')}
                            </span>
                            {account.is_system && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    System Account
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/accounts"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        {!account.is_system && (
                            <Link
                                href={`/accounts/${account.id}/edit`}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-2">Current Balance</p>
                            <p className="text-4xl font-bold">
                                {formatCurrency(account.current_balance)}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <Wallet className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Account Details */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Account Name</label>
                            <p className="mt-1 text-gray-900 font-medium">{account.name}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Account Type</label>
                            <p className="mt-1">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(account.type)}`}>
                                    {account.type.replace('_', ' ')}
                                </span>
                            </p>
                        </div>

                        {account.description && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-gray-900">{account.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                {transactions && transactions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">
                                            {new Date(transaction.transaction_date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4">{transaction.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                {transaction.category.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default AccountShow;
