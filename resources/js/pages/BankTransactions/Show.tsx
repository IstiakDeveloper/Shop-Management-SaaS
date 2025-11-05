import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Edit2, Building2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

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
    created_at: string;
}

interface Props {
    transaction: BankTransaction;
}

const BankTransactionShow: React.FC<Props> = ({ transaction }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="Transaction Details" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
                        <p className="text-gray-600 mt-1">{transaction.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/bank-transactions"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                    </div>
                </div>

                {/* Transaction Amount Card */}
                <div className={`rounded-xl shadow-sm border p-8 ${transaction.type === 'credit' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">
                                {transaction.type === 'credit' ? 'Credit Amount (Money In)' : 'Debit Amount (Money Out)'}
                            </p>
                            <p className={`text-4xl font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                Balance After: {formatCurrency(transaction.balance_after)}
                            </p>
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${transaction.type === 'credit' ? 'bg-green-200' : 'bg-red-200'}`}>
                            {transaction.type === 'credit' ? (
                                <TrendingUp className="w-8 h-8 text-green-700" />
                            ) : (
                                <TrendingDown className="w-8 h-8 text-red-700" />
                            )}
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
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    transaction.type === 'credit'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {transaction.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Created By</label>
                            <p className="mt-1 text-gray-900">{transaction.created_by.name}</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="mt-1 text-gray-900">{transaction.description}</p>
                        </div>

                        {transaction.reference_type && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500">Reference</label>
                                <p className="mt-1 text-gray-900">
                                    {transaction.reference_type} #{transaction.reference_id}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 rounded-xl border p-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Transaction ID:</span> #{transaction.id}
                        </div>
                        <div>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(transaction.created_at).toLocaleDateString('en-GB')}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default BankTransactionShow;
