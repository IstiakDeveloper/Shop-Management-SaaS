import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Account {
    id: number;
    name: string;
    code: string;
    type: string;
}

interface Props {
    accounts: Account[];
}

interface EntryRow {
    account_id: string;
    debit: string;
    credit: string;
}

const TransactionCreate: React.FC<Props> = ({ accounts }) => {
    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        entries: [
            { account_id: '', debit: '', credit: '' },
            { account_id: '', debit: '', credit: '' },
        ] as EntryRow[],
    });

    const addEntry = () => {
        setData('entries', [...data.entries, { account_id: '', debit: '', credit: '' }]);
    };

    const removeEntry = (index: number) => {
        if (data.entries.length > 2) {
            setData('entries', data.entries.filter((_, i) => i !== index));
        }
    };

    const updateEntry = (index: number, field: keyof EntryRow, value: string) => {
        const updatedEntries = [...data.entries];
        updatedEntries[index] = { ...updatedEntries[index], [field]: value };
        setData('entries', updatedEntries);
    };

    const calculateTotals = () => {
        const totalDebit = data.entries.reduce((sum, entry) => sum + parseFloat(entry.debit || '0'), 0);
        const totalCredit = data.entries.reduce((sum, entry) => sum + parseFloat(entry.credit || '0'), 0);
        return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit && totalDebit > 0 };
    };

    const { totalDebit, totalCredit, isBalanced } = calculateTotals();

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBalanced) {
            alert('Debits and Credits must be equal and greater than zero!');
            return;
        }
        post('/transactions');
    };

    return (
        <AppLayout>
            <Head title="Create Journal Entry" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Journal Entry</h1>
                        <p className="text-gray-600 mt-1">Record accounting transaction</p>
                    </div>
                    <Link
                        href="/transactions"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    {/* Transaction Details */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.date ? 'border-red-500' : ''}`}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                            <input
                                type="text"
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="REF-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : ''}`}
                                placeholder="Brief description"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Journal Entries */}
                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Journal Entries</h2>
                            <button
                                type="button"
                                onClick={addEntry}
                                className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Entry</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                                <div className="col-span-6">Account</div>
                                <div className="col-span-2 text-right">Debit</div>
                                <div className="col-span-2 text-right">Credit</div>
                                <div className="col-span-2"></div>
                            </div>

                            {data.entries.map((entry, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-start">
                                    <div className="col-span-6">
                                        <select
                                            value={entry.account_id}
                                            onChange={(e) => updateEntry(index, 'account_id', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select account</option>
                                            {accounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.code} - {account.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={entry.debit}
                                            onChange={(e) => {
                                                updateEntry(index, 'debit', e.target.value);
                                                if (e.target.value) updateEntry(index, 'credit', '');
                                            }}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={entry.credit}
                                            onChange={(e) => {
                                                updateEntry(index, 'credit', e.target.value);
                                                if (e.target.value) updateEntry(index, 'debit', '');
                                            }}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        {data.entries.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeEntry(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-6 pt-6 border-t">
                            <div className="grid grid-cols-12 gap-3 px-3">
                                <div className="col-span-6 text-right font-bold text-gray-900">Totals:</div>
                                <div className="col-span-2">
                                    <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-right font-bold text-green-700">
                                        {formatCurrency(totalDebit)}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-right font-bold text-red-700">
                                        {formatCurrency(totalCredit)}
                                    </div>
                                </div>
                                <div className="col-span-2"></div>
                            </div>

                            {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2 text-yellow-800">
                                    <AlertTriangle className="w-5 h-5" />
                                    <p className="text-sm font-medium">
                                        Debits and Credits must be equal! Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                                    </p>
                                </div>
                            )}

                            {isBalanced && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                                    <p className="text-sm font-medium">✓ Transaction is balanced</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link
                            href="/transactions"
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || !isBalanced}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Save Transaction'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default TransactionCreate;
