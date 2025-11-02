import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
    ArrowLeft,
    Edit2,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    TrendingUp,
    Calendar,
    ShoppingCart,
    Building2,
    CreditCard,
} from 'lucide-react';

interface Purchase {
    id: number;
    invoice_number: string;
    purchase_date: string;
    total: number;
    paid: number;
    due: number;
}

interface Vendor {
    id: number;
    name: string;
    company_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    opening_due: number;
    current_due: number;
    is_active: boolean;
    created_at: string;
    purchases: Purchase[];
}

interface Props {
    vendor: Vendor;
}

const VendorShow: React.FC<Props> = ({ vendor }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const totalPurchases = vendor.purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0);
    const totalPaid = vendor.purchases.reduce((sum, purchase) => sum + parseFloat(purchase.paid.toString()), 0);
    const totalDue = parseFloat(vendor.opening_due.toString()) + parseFloat(vendor.current_due.toString());

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/vendors/${vendor.id}/payment`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowPaymentModal(false);
            },
            onError: (errors) => {
                console.log('Payment errors:', errors);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={vendor.name} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                        <p className="text-gray-600 mt-1">
                            Vendor since {new Date(vendor.created_at).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/vendors"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        <Link
                            href={`/vendors/${vendor.id}/edit`}
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
                            <h3 className="text-lg font-semibold text-gray-900">Total Purchases</h3>
                            <ShoppingCart className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-2">{vendor.purchases.length}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(totalPurchases)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Total Paid</h3>
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(totalPaid)}</p>
                        <p className="text-sm text-gray-500">Paid to vendor</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Current Due</h3>
                            <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold text-orange-600 mb-2">
                            {formatCurrency(parseFloat(vendor.current_due.toString()))}
                        </p>
                        <p className="text-sm text-gray-500">From Purchases</p>
                        {parseFloat(vendor.current_due.toString()) > 0 && (
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center space-x-2"
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Make Payment</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Total Due</h3>
                            <DollarSign className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-3xl font-bold text-red-600 mb-2">{formatCurrency(totalDue)}</p>
                        <p className="text-sm text-gray-500">Opening + Current</p>
                    </div>
                </div>

                {/* Vendor Details */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {vendor.company_name && (
                            <div className="flex items-start space-x-3">
                                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Company</label>
                                    <p className="mt-1 text-gray-900">{vendor.company_name}</p>
                                </div>
                            </div>
                        )}
                        {vendor.phone && (
                            <div className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="mt-1 text-gray-900">{vendor.phone}</p>
                                </div>
                            </div>
                        )}
                        {vendor.email && (
                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="mt-1 text-gray-900">{vendor.email}</p>
                                </div>
                            </div>
                        )}
                        {vendor.address && (
                            <div className="flex items-start space-x-3 md:col-span-2">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Address</label>
                                    <p className="mt-1 text-gray-900">{vendor.address}</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-500">Opening Due</label>
                            <p className="mt-1 text-gray-900 font-medium">{formatCurrency(parseFloat(vendor.opening_due.toString()))}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className="mt-1">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {vendor.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Purchase History */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Purchase History</h2>
                        <Link
                            href={`/purchases/create?vendor=${vendor.id}`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                        >
                            New Purchase
                        </Link>
                    </div>
                    {vendor.purchases && vendor.purchases.length > 0 ? (
                        <div className="space-y-3">
                            {vendor.purchases.map((purchase) => (
                                <Link
                                    key={purchase.id}
                                    href={`/purchases/${purchase.id}`}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                            {purchase.invoice_number.slice(-2)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{purchase.invoice_number}</p>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(purchase.purchase_date).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(parseFloat(purchase.total.toString()))}</p>
                                        {parseFloat(purchase.due.toString()) > 0 && (
                                            <span className="text-xs text-red-600 font-medium">
                                                Due: {formatCurrency(parseFloat(purchase.due.toString()))}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No purchase history</p>
                            <Link
                                href={`/purchases/create?vendor=${vendor.id}`}
                                className="inline-block mt-3 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                            >
                                Create First Purchase
                            </Link>
                        </div>
                    )}
                </div>

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Make Payment to {vendor.name}</h2>
                            <form onSubmit={handlePayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.amount ? 'border-red-500' : ''}`}
                                        placeholder="0.00"
                                        max={parseFloat(vendor.current_due.toString())}
                                        required
                                    />
                                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Current Due: {formatCurrency(parseFloat(vendor.current_due.toString()))}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.payment_date}
                                        onChange={(e) => setData('payment_date', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Payment reference or notes..."
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            reset();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span>{processing ? 'Processing...' : 'Pay Now'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default VendorShow;
