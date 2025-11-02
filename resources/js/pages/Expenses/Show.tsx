import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, DollarSign, Calendar, User } from 'lucide-react';

interface Transaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    transaction_date: string;
    balance_after: number;
    created_by: { id: number; name: string };
    created_at: string;
}

interface Props {
    transaction: Transaction;
}

const ExpenseShow: React.FC<Props> = ({ transaction }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="Expense Details" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Expense Details</h1>
                        <p className="text-gray-600 mt-1">{transaction.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/expenses"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                    </div>
                </div>

                {/* Amount Card */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-2">Expense Amount</p>
                            <p className="text-4xl font-bold">
                                {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-sm opacity-90 mt-2">
                                Expense Account Balance: {formatCurrency(transaction.balance_after)}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <DollarSign className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                            <p className="mt-1 text-gray-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(transaction.transaction_date).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Category</label>
                            <p className="mt-1">
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                    {transaction.category.replace('_', ' ').toUpperCase()}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Created By</label>
                            <p className="mt-1 text-gray-900 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {transaction.created_by.name}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Created At</label>
                            <p className="mt-1 text-gray-900">
                                {new Date(transaction.created_at).toLocaleDateString('en-GB')}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="mt-1 text-gray-900">{transaction.description}</p>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 rounded-xl border p-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Transaction ID:</span> #{transaction.id}
                        </div>
                        <div>
                            <span className="font-medium">Account:</span> Expense Account
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ExpenseShow;
