import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

interface Account {
    id: number;
    name: string;
    code: string;
}

interface Entry {
    id: number;
    account: Account;
    debit: number;
    credit: number;
}

interface Transaction {
    id: number;
    date: string;
    description: string;
    reference: string | null;
    total_amount: number;
    created_at: string;
    entries: Entry[];
}

interface Props {
    transaction: Transaction;
}

const TransactionShow: React.FC<Props> = ({ transaction }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            window.location.href = `/transactions/${transaction.id}/delete`;
        }
    };

    const totalDebit = transaction.entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = transaction.entries.reduce((sum, e) => sum + e.credit, 0);

    return (
        <AppLayout>
            <Head title={`Transaction - ${transaction.reference || transaction.id}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
                        <p className="text-gray-600 mt-1">Reference: {transaction.reference || `#${transaction.id}`}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/transactions/${transaction.id}/edit`}
                            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center space-x-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                        <Link
                            href="/transactions"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                    </div>
                </div>

                {/* Transaction Info */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Information</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date</p>
                            <p className="mt-1 text-gray-900">{new Date(transaction.date).toLocaleDateString('en-GB')}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Reference</p>
                            <p className="mt-1 text-gray-900">{transaction.reference || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created</p>
                            <p className="mt-1 text-gray-900">{new Date(transaction.created_at).toLocaleDateString('en-GB')}</p>
                        </div>
                        <div className="md:col-span-3">
                            <p className="text-sm font-medium text-gray-500">Description</p>
                            <p className="mt-1 text-gray-900">{transaction.description}</p>
                        </div>
                    </div>
                </div>

                {/* Journal Entries */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Journal Entries</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transaction.entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.account.code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{entry.account.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            {entry.debit > 0 ? (
                                                <span className="text-green-600 font-medium">{formatCurrency(entry.debit)}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {entry.credit > 0 ? (
                                                <span className="text-red-600 font-medium">{formatCurrency(entry.credit)}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-right font-bold text-gray-900">Totals:</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600">{formatCurrency(totalDebit)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600">{formatCurrency(totalCredit)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {totalDebit === totalCredit && (
                        <div className="px-6 py-4 bg-green-50 border-t">
                            <p className="text-sm font-medium text-green-800">✓ Transaction is balanced</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default TransactionShow;
