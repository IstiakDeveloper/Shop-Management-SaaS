import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, BookOpen, Printer } from 'lucide-react';

interface Account {
    id: number;
    name: string;
    code: string;
}

interface Entry {
    id: number;
    transaction_id: number;
    account: Account;
    debit: number;
    credit: number;
    transaction: {
        id: number;
        date: string;
        description: string;
        reference: string | null;
    };
}

interface Props {
    entries: {
        data: Entry[];
        current_page: number;
        last_page: number;
    };
    start_date: string;
    end_date: string;
}

const Journal: React.FC<Props> = ({ entries, start_date, end_date }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const totalDebit = entries.data.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.data.reduce((sum, e) => sum + e.credit, 0);

    return (
        <AppLayout>
            <Head title="General Journal" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                            <BookOpen className="w-8 h-8 text-indigo-600" />
                            <span>General Journal</span>
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {new Date(start_date).toLocaleDateString('en-GB')} to {new Date(end_date).toLocaleDateString('en-GB')}
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
                            href="/transactions"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {entries.data.length > 0 ? (
                                    entries.data.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(entry.transaction.date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {entry.transaction.reference || `-`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{entry.account.name}</p>
                                                    <p className="text-xs text-gray-500">{entry.account.code}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {entry.transaction.description}
                                            </td>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                            <p>No journal entries found for this period</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {entries.data.length > 0 && (
                                <tfoot className="bg-gray-50 border-t-2">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right font-bold text-gray-900">Totals:</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">{formatCurrency(totalDebit)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600">{formatCurrency(totalCredit)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {entries.last_page > 1 && (
                        <div className="px-6 py-4 border-t flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing page {entries.current_page} of {entries.last_page}
                            </p>
                            <div className="flex items-center space-x-2">
                                {entries.current_page > 1 && (
                                    <Link
                                        href={`/transactions/journal?page=${entries.current_page - 1}`}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {entries.current_page < entries.last_page && (
                                    <Link
                                        href={`/transactions/journal?page=${entries.current_page + 1}`}
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

export default Journal;
