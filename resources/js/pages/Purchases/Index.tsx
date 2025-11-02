import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Search, Plus, Trash2, Eye, Edit2 } from 'lucide-react';

interface Purchase {
    id: number;
    invoice_number: string;
    vendor: { id: number; name: string };
    purchase_date: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    due: number;
    status: 'pending' | 'completed' | 'returned';
    created_by: { id: number; name: string };
    notes?: string;
}

interface Props {
    purchases: {
        data: Purchase[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const PurchasesIndex: React.FC<Props> = ({ purchases }) => {
    const [search, setSearch] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/purchases', { search }, { preserveState: true });
    };

    const deletePurchase = (id: number) => {
        if (confirm('Are you sure you want to delete this purchase? This will not reverse stock or bank transactions.')) {
            router.delete(`/purchases/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'returned': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (due: number, total: number) => {
        if (due <= 0) return 'bg-green-100 text-green-800'; // Paid
        if (due < total) return 'bg-orange-100 text-orange-800'; // Partial
        return 'bg-red-100 text-red-800'; // Unpaid
    };

    const getPaymentStatus = (due: number, total: number) => {
        if (due <= 0) return 'Paid';
        if (due < total) return 'Partial';
        return 'Unpaid';
    };

    const totalPurchases = purchases.data.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0);
    const totalPaid = purchases.data.reduce((sum, purchase) => sum + parseFloat(purchase.paid.toString()), 0);
    const totalBalance = purchases.data.reduce((sum, purchase) => sum + parseFloat(purchase.due.toString()), 0);

    return (
        <AppLayout>
            <Head title="Purchases" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
                        <p className="text-gray-600 mt-1">Manage your purchase orders</p>
                    </div>
                    <Link
                        href="/purchases/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Purchase</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{purchases.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Purchase Amount</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(totalPurchases)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Paid Amount</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Balance Due</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by invoice or vendor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                    </div>
                </form>

                {/* Purchases Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {purchases.data.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/purchases/${purchase.id}`}
                                                className="text-indigo-600 hover:underline font-medium"
                                            >
                                                {purchase.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{purchase.vendor.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(purchase.purchase_date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(parseFloat(purchase.total.toString()))}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-green-600 font-medium">
                                            {formatCurrency(parseFloat(purchase.paid.toString()))}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                                            {formatCurrency(parseFloat(purchase.due.toString()))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(parseFloat(purchase.due.toString()), parseFloat(purchase.total.toString()))}`}>
                                                {getPaymentStatus(parseFloat(purchase.due.toString()), parseFloat(purchase.total.toString()))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/purchases/${purchase.id}`}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/purchases/${purchase.id}/edit`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deletePurchase(purchase.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {purchases.last_page > 1 && (
                        <div className="px-6 py-4 border-t">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing page {purchases.current_page} of {purchases.last_page}
                                </p>
                                <div className="flex items-center space-x-2">
                                    {purchases.current_page > 1 && (
                                        <button
                                            onClick={() => router.get(`/purchases?page=${purchases.current_page - 1}`)}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {purchases.current_page < purchases.last_page && (
                                        <button
                                            onClick={() => router.get(`/purchases?page=${purchases.current_page + 1}`)}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default PurchasesIndex;
