import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Package, Building2, Calendar, FileText, Edit2 } from 'lucide-react';

interface Purchase {
    id: number;
    invoice_number: string;
    vendor: { id: number; name: string; email?: string; phone?: string };
    created_by: { id: number; name: string };
    purchase_date: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    due: number;
    status: 'pending' | 'completed' | 'returned';
    notes: string | null;
    created_at: string;
    purchase_items: Array<{
        id: number;
        product: { id: number; name: string; code: string };
        quantity: number;
        unit_price: number;
        total: number;
    }>;
}

interface Props {
    purchase: Purchase;
}

const PurchaseShow: React.FC<Props> = ({ purchase }) => {
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

    return (
        <AppLayout>
            <Head title={`Purchase ${purchase.invoice_number}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Purchase Details</h1>
                        <p className="text-gray-600 mt-1">{purchase.invoice_number}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/purchases/${purchase.id}/edit`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                        <Link
                            href="/purchases"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm font-medium text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(purchase.total)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Paid Amount</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(purchase.paid)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Balance Due</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(purchase.due)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                        <div className="space-y-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                                {purchase.status}
                            </span>
                            <br />
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(purchase.due, purchase.total)}`}>
                                {getPaymentStatus(purchase.due, purchase.total)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Purchase Information */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Vendor</p>
                                    <Link href={`/vendors/${purchase.vendor.id}`} className="text-indigo-600 hover:underline font-medium">
                                        {purchase.vendor.name}
                                    </Link>
                                    <p className="text-sm text-gray-500">{purchase.vendor.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                                    <p className="text-gray-900">
                                        {new Date(purchase.purchase_date).toLocaleDateString('en-GB', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Created By</p>
                                    <p className="text-gray-900">{purchase.created_by.name}</p>
                                    <p className="text-sm text-gray-500">{new Date(purchase.created_at).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>

                            {purchase.notes && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Notes</p>
                                    <p className="text-gray-900">{purchase.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Purchase Items */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Purchase Items
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {purchase.purchase_items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{item.product.name}</p>
                                                <p className="text-sm text-gray-500">{item.product.code}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-900">{Math.round(item.quantity)}</td>
                                            <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-600">Subtotal</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(purchase.subtotal)}</td>
                                    </tr>
                                    {purchase.discount > 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-gray-600">Discount</td>
                                            <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(purchase.discount)}</td>
                                        </tr>
                                    )}
                                    <tr className="bg-gray-50">
                                        <td colSpan={3} className="px-4 py-3 text-right text-lg font-bold text-gray-900">Total</td>
                                        <td className="px-4 py-3 text-right text-lg font-bold text-indigo-600">
                                            {formatCurrency(purchase.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PurchaseShow;
