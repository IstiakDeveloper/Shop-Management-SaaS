import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Search, Filter, Plus, Edit2, Trash2, Eye, CheckCircle, DollarSign } from 'lucide-react';

interface Sale {
    id: number;
    invoice_number: string;
    customer: { id: number; name: string } | null;
    sale_date: string;
    subtotal: number | string;
    discount: number | string;
    total: number | string;
    paid: number | string;
    due: number | string;
    status: 'pending' | 'completed' | 'cancelled' | 'returned';
    payment_method: string | null;
    created_by: { id: number; name: string };
}

interface Props {
    sales: {
        data: Sale[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const SalesIndex: React.FC<Props> = ({ sales, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/sales', { search, status }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get('/sales', {}, { preserveState: true });
    };

    const deleteSale = (id: number) => {
        if (confirm('Are you sure you want to delete this sale?')) {
            router.delete(`/sales/${id}`);
        }
    };

    const completeSale = (id: number) => {
        if (confirm('Complete this sale? Stock will be deducted.')) {
            router.post(`/sales/${id}/complete`);
        }
    };

    const formatCurrency = (amount: number | string) => {
        // Convert to number if it's string and handle any formatting issues
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        // Return 0 if invalid number
        if (isNaN(numAmount)) return '৳0.00';

        // Format with proper decimals
        return `৳${numAmount.toLocaleString('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatus = (paid: number | string, total: number | string): string => {
        const paidAmount = typeof paid === 'string' ? parseFloat(paid) : paid;
        const totalAmount = typeof total === 'string' ? parseFloat(total) : total;

        if (isNaN(paidAmount) || isNaN(totalAmount)) return 'unpaid';

        if (paidAmount >= totalAmount) return 'paid';
        if (paidAmount > 0) return 'partial';
        return 'unpaid';
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-orange-100 text-orange-800';
            case 'unpaid': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const totalSales = sales.data.reduce((sum, sale) => {
        const total = typeof sale.total === 'string' ? parseFloat(sale.total) : sale.total;
        return sum + (isNaN(total) ? 0 : total);
    }, 0);

    const totalPaid = sales.data.reduce((sum, sale) => {
        const paid = typeof sale.paid === 'string' ? parseFloat(sale.paid) : sale.paid;
        return sum + (isNaN(paid) ? 0 : paid);
    }, 0);

    const totalBalance = sales.data.reduce((sum, sale) => {
        const due = typeof sale.due === 'string' ? parseFloat(sale.due) : sale.due;
        return sum + (isNaN(due) ? 0 : due);
    }, 0);

    return (
        <AppLayout>
            <Head title="Sales" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
                        <p className="text-gray-600 mt-1">Manage your sales invoices</p>
                    </div>
                    <Link
                        href="/sales/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Sale</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm font-medium text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{sales.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Sales Amount</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(totalSales)}</p>
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

                {/* Filters */}
                <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Search by invoice or customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                        {(search || status) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </form>

                {/* Sales Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
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
                                {sales.data.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/sales/${sale.id}`}
                                                className="text-indigo-600 hover:underline font-medium"
                                            >
                                                {sale.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {sale.customer ? sale.customer.name : 'Walk-in Customer'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(sale.sale_date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(sale.total)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-green-600 font-medium">
                                            {formatCurrency(sale.paid)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                                            {formatCurrency(sale.due)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const paymentStatus = getPaymentStatus(sale.paid, sale.total);
                                                return (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(paymentStatus)}`}>
                                                        {paymentStatus}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/sales/${sale.id}`}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {sale.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => completeSale(sale.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                            title="Complete"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <Link
                                                            href={`/sales/${sale.id}/edit`}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                    </>
                                                )}
                                                {getPaymentStatus(sale.paid, sale.total) !== 'paid' && sale.status === 'completed' && (
                                                    <Link
                                                        href={`/sales/${sale.id}?payment=true`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Add Payment"
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                {sale.status === 'pending' && (
                                                    <button
                                                        onClick={() => deleteSale(sale.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {sales.last_page > 1 && (
                        <div className="px-6 py-4 border-t">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing page {sales.current_page} of {sales.last_page}
                                </p>
                                <div className="flex items-center space-x-2">
                                    {sales.current_page > 1 && (
                                        <button
                                            onClick={() => router.get(`/sales?page=${sales.current_page - 1}`)}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {sales.current_page < sales.last_page && (
                                        <button
                                            onClick={() => router.get(`/sales?page=${sales.current_page + 1}`)}
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

export default SalesIndex;
