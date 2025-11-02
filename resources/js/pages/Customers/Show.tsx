import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Edit2, User, Phone, Mail, MapPin, CreditCard, TrendingUp, Calendar, ShoppingCart } from 'lucide-react';

interface Sale {
    id: number;
    invoice_number: string;
    sale_date: string;
    total: number;
    paid: number;
    due: number;
    status: string;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    opening_due: number;
    current_due: number;
    is_active: boolean;
    created_at: string;
    sales: Sale[];
}

interface Props {
    customer: Customer;
}

const CustomerShow: React.FC<Props> = ({ customer }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const totalSales = customer.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPaid = customer.sales.reduce((sum, sale) => sum + sale.paid, 0);
    const totalDue = customer.opening_due + customer.current_due;

    return (
        <AppLayout>
            <Head title={customer.name} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                        <p className="text-gray-600 mt-1">Customer since {new Date(customer.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/customers"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Total Sales</h3>
                            <ShoppingCart className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                            {customer.sales.length}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatCurrency(totalSales)}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Total Paid</h3>
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-green-600 mb-2">
                            {formatCurrency(totalPaid)}
                        </p>
                        <p className="text-sm text-gray-500">Collected</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Current Due</h3>
                            <CreditCard className="w-6 h-6 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold text-orange-600 mb-2">
                            {formatCurrency(customer.current_due)}
                        </p>
                        <p className="text-sm text-gray-500">From Sales</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Total Due</h3>
                            <CreditCard className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-3xl font-bold text-red-600 mb-2">
                            {formatCurrency(totalDue)}
                        </p>
                        <p className="text-sm text-gray-500">Opening + Current</p>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                <p className="mt-1 text-gray-900">{customer.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="mt-1 text-gray-900">{customer.email || '-'}</p>
                            </div>
                        </div>
                        {customer.address && (
                            <div className="flex items-start space-x-3 md:col-span-2">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Address</label>
                                    <p className="mt-1 text-gray-900">{customer.address}</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-500">Opening Due</label>
                            <p className="mt-1 text-gray-900 font-medium">{formatCurrency(customer.opening_due)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className="mt-1">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sales History */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Sales History</h2>
                        <Link
                            href={`/sales/create?customer=${customer.id}`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                        >
                            New Sale
                        </Link>
                    </div>
                    {customer.sales && customer.sales.length > 0 ? (
                        <div className="space-y-3">
                            {customer.sales.map((sale) => (
                                <Link
                                    key={sale.id}
                                    href={`/sales/${sale.id}`}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                            {sale.invoice_number.slice(-2)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{sale.invoice_number}</p>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(sale.sale_date).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(sale.total)}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                sale.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {sale.status}
                                            </span>
                                            {sale.due > 0 && (
                                                <span className="text-xs text-red-600 font-medium">
                                                    Due: {formatCurrency(sale.due)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No sales history</p>
                            <Link
                                href={`/sales/create?customer=${customer.id}`}
                                className="inline-block mt-3 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                            >
                                Create First Sale
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default CustomerShow;
