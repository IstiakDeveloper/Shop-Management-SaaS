import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import PaymentModal from '@/components/PaymentModal';
import { ArrowLeft, Edit2, CheckCircle, DollarSign, Package, User, Calendar, FileText, Printer } from 'lucide-react';

interface Sale {
    id: number;
    invoice_number: string;
    customer: { id: number; name: string; email: string; phone: string } | null;
    user: { id: number; name: string };
    sale_date: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    due: number;
    status: 'pending' | 'completed' | 'cancelled' | 'returned';
    payment_method: string | null;
    notes: string | null;
    created_at: string;
    sale_items: Array<{
        id: number;
        product: { id: number; name: string; code: string };
        quantity: number;
        unit_price: number;
    }>;
}

interface Props {
    sale: Sale;
    shouldPrintReceipt?: boolean;
}

const SaleShow: React.FC<Props> = ({ sale, shouldPrintReceipt }) => {
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    // Auto-prompt for receipt printing if just created
    useEffect(() => {
        if (shouldPrintReceipt) {
            const shouldPrint = confirm('Sale created successfully! Would you like to print the receipt?');
            if (shouldPrint) {
                printReceipt();
            }
        }
    }, [shouldPrintReceipt]);

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getPaymentStatus = (paid: number, total: number): string => {
        if (paid >= total) return 'paid';
        if (paid > 0) return 'partial';
        return 'unpaid';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'returned': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-orange-100 text-orange-800';
            case 'unpaid': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const completeSale = () => {
        if (confirm('Complete this sale? Stock will be deducted.')) {
            router.post(`/sales/${sale.id}/complete`);
        }
    };

    const printReceipt = () => {
        window.open(`/sales/${sale.id}/print`, '_blank');
    };

    const openPaymentModal = () => {
        setPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setPaymentModalOpen(false);
    };

    return (
        <AppLayout>
            <Head title={`Sale ${sale.invoice_number}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sale Details</h1>
                        <p className="text-gray-600 mt-1">{sale.invoice_number}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={printReceipt}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print</span>
                        </button>
                        <Link
                            href="/sales"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        {sale.status === 'pending' && (
                            <>
                                <button
                                    onClick={completeSale}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Complete Sale</span>
                                </button>
                                <Link
                                    href={`/sales/${sale.id}/edit`}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit</span>
                                </Link>
                            </>
                        )}
                        {getPaymentStatus(sale.paid, sale.total) !== 'paid' && sale.status === 'completed' && (
                            <button
                                onClick={openPaymentModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                                <DollarSign className="w-4 h-4" />
                                <span>Add Payment</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm font-medium text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(sale.total)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Paid Amount</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(sale.paid)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Balance Due</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(sale.due)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                        <div className="space-y-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                                {sale.status}
                            </span>
                            <br />
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(getPaymentStatus(sale.paid, sale.total))}`}>
                                {getPaymentStatus(sale.paid, sale.total)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Sale Information */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Sale Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Customer</p>
                                    {sale.customer ? (
                                        <Link href={`/customers/${sale.customer.id}`} className="text-indigo-600 hover:underline font-medium">
                                            {sale.customer.name}
                                        </Link>
                                    ) : (
                                        <p className="text-gray-900">Walk-in Customer</p>
                                    )}
                                    {sale.customer && (
                                        <p className="text-sm text-gray-500">{sale.customer.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Sale Date</p>
                                    <p className="text-gray-900">{new Date(sale.sale_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Created By</p>
                                    <p className="text-gray-900">{sale.user.name}</p>
                                    <p className="text-sm text-gray-500">{new Date(sale.created_at).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>

                            {sale.payment_method && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                    <p className="text-gray-900 capitalize">{sale.payment_method.replace('_', ' ')}</p>
                                </div>
                            )}

                            {sale.notes && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Notes</p>
                                    <p className="text-gray-900">{sale.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sale Items */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Sale Items
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
                                    {sale.sale_items?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{item.product?.name || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{item.product?.code || 'N/A'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-900">{Math.round(item.quantity) || 0}</td>
                                            <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unit_price || 0)}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</td>
                                        </tr>
                                    ))}
                                    {(!sale.sale_items || sale.sale_items.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                No items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="border-t-2">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-600">Subtotal</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(sale.subtotal)}</td>
                                    </tr>
                                    {sale.discount > 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-gray-600">Discount</td>
                                            <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(sale.discount)}</td>
                                        </tr>
                                    )}
                                    <tr className="bg-gray-50">
                                        <td colSpan={3} className="px-4 py-3 text-right text-lg font-bold text-gray-900">Total</td>
                                        <td className="px-4 py-3 text-right text-lg font-bold text-indigo-600">{formatCurrency(sale.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={closePaymentModal}
                    saleId={sale.id}
                    invoiceNumber={sale.invoice_number}
                    dueAmount={sale.due}
                    totalAmount={sale.total}
                />
            </div>
        </AppLayout>
    );
};

export default SaleShow;
