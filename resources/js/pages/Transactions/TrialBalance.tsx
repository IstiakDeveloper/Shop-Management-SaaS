import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Scale, Printer } from 'lucide-react';

interface AccountBalance {
    account: {
        id: number;
        name: string;
        code: string;
        type: string;
    };
    debit_balance: number;
    credit_balance: number;
}

interface Props {
    account_balances: AccountBalance[];
    total_debits: number;
    total_credits: number;
    as_of_date: string;
}

const TrialBalance: React.FC<Props> = ({ account_balances, total_debits, total_credits, as_of_date }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const isBalanced = Math.abs(total_debits - total_credits) < 0.01;

    const groupedAccounts = account_balances.reduce((acc, item) => {
        const type = item.account.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
    }, {} as Record<string, AccountBalance[]>);

    const typeOrder = ['asset', 'liability', 'equity', 'income', 'expense'];
    const typeLabels: Record<string, string> = {
        asset: 'Assets',
        liability: 'Liabilities',
        equity: 'Equity',
        income: 'Income',
        expense: 'Expenses',
    };

    return (
        <AppLayout>
            <Head title="Trial Balance" />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                            <Scale className="w-8 h-8 text-purple-600" />
                            <span>Trial Balance</span>
                        </h1>
                        <p className="text-gray-600 mt-1">
                            As of {new Date(as_of_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
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

                {/* Balance Status */}
                <div className={`p-4 rounded-xl border-2 ${isBalanced ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <p className={`text-center font-bold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                        {isBalanced ? '✓ Books are balanced' : '⚠ Books are out of balance'}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                            <tbody>
                                {typeOrder.map((type) => {
                                    const accounts = groupedAccounts[type] || [];
                                    if (accounts.length === 0) return null;

                                    return (
                                        <React.Fragment key={type}>
                                            <tr className="bg-gray-100">
                                                <td colSpan={4} className="px-6 py-2 font-bold text-gray-900 uppercase text-sm">
                                                    {typeLabels[type]}
                                                </td>
                                            </tr>
                                            {accounts.map((item) => (
                                                <tr key={item.account.id} className="hover:bg-gray-50 border-b">
                                                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                        {item.account.code}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-gray-900">
                                                        {item.account.name}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        {item.debit_balance > 0 ? (
                                                            <span className="text-green-600 font-medium">
                                                                {formatCurrency(item.debit_balance)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        {item.credit_balance > 0 ? (
                                                            <span className="text-red-600 font-medium">
                                                                {formatCurrency(item.credit_balance)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600 text-lg">
                                        {formatCurrency(total_debits)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600 text-lg">
                                        {formatCurrency(total_credits)}
                                    </td>
                                </tr>
                                {!isBalanced && (
                                    <tr className="bg-red-50">
                                        <td colSpan={2} className="px-6 py-3 text-right font-bold text-red-700">
                                            Difference:
                                        </td>
                                        <td colSpan={2} className="px-6 py-3 text-right font-bold text-red-700">
                                            {formatCurrency(Math.abs(total_debits - total_credits))}
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default TrialBalance;
