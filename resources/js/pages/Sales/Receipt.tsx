import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

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
    status: string;
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
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
}

const Receipt: React.FC<Props> = ({
    sale,
    shopName = "Shop Management System",
    shopAddress = "123 Business Street, City",
    shopPhone = "+880 1234-567890"
}) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    // Auto-print when component loads
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title={`Receipt - ${sale.invoice_number}`} />
            <div className="receipt-container max-w-sm mx-auto bg-white p-4 font-mono text-sm">
                {/* Header */}
                <div className="text-center border-b border-dashed border-gray-400 pb-4 mb-4">
                    <h1 className="text-lg font-bold uppercase">{shopName}</h1>
                    <p className="text-xs text-gray-600 mt-1">{shopAddress}</p>
                    <p className="text-xs text-gray-600">Phone: {shopPhone}</p>
                </div>

                {/* Invoice Info */}
                <div className="border-b border-dashed border-gray-400 pb-4 mb-4">
                    <div className="flex justify-between mb-1">
                        <span>Invoice:</span>
                        <span className="font-bold">{sale.invoice_number}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Date:</span>
                        <span>{new Date(sale.sale_date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Time:</span>
                        <span>{new Date(sale.created_at).toLocaleTimeString('en-GB', { hour12: true })}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Customer:</span>
                        <span>{sale.customer ? sale.customer.name : 'Walk-in'}</span>
                    </div>
                    {sale.customer?.phone && (
                        <div className="flex justify-between mb-1">
                            <span>Phone:</span>
                            <span>{sale.customer.phone}</span>
                        </div>
                    )}
                    <div className="flex justify-between mb-1">
                        <span>Cashier:</span>
                        <span>{sale.user.name}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="border-b border-dashed border-gray-400 pb-4 mb-4">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-300">
                                <th className="text-left py-1">Item</th>
                                <th className="text-center py-1">Qty</th>
                                <th className="text-right py-1">Price</th>
                                <th className="text-right py-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.sale_items?.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="py-1">
                                        <div>
                                            <div className="font-medium">{item.product?.name}</div>
                                            <div className="text-gray-500">{item.product?.code}</div>
                                        </div>
                                    </td>
                                    <td className="text-center py-1">{item.quantity}</td>
                                    <td className="text-right py-1">{formatCurrency(item.unit_price)}</td>
                                    <td className="text-right py-1 font-medium">
                                        {formatCurrency(item.quantity * item.unit_price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="border-b border-dashed border-gray-400 pb-4 mb-4">
                    <div className="flex justify-between mb-1">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(sale.subtotal)}</span>
                    </div>
                    {sale.discount > 0 && (
                        <div className="flex justify-between mb-1">
                            <span>Discount:</span>
                            <span>-{formatCurrency(sale.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between mb-2 text-lg font-bold border-t border-gray-300 pt-1">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(sale.total)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Paid:</span>
                        <span>{formatCurrency(sale.paid)}</span>
                    </div>
                    {sale.paid - sale.total > 0 && (
                        <div className="flex justify-between mb-1">
                            <span>Change:</span>
                            <span>{formatCurrency(sale.paid - sale.total)}</span>
                        </div>
                    )}
                    {sale.due > 0 && (
                        <div className="flex justify-between mb-1 font-bold text-red-600">
                            <span>Balance Due:</span>
                            <span>{formatCurrency(sale.due)}</span>
                        </div>
                    )}
                    <div className="flex justify-between mb-1">
                        <span>Payment:</span>
                        <span className="capitalize">{sale.payment_method || 'Cash'}</span>
                    </div>
                </div>

                {/* Notes */}
                {sale.notes && (
                    <div className="border-b border-dashed border-gray-400 pb-4 mb-4">
                        <div className="text-xs">
                            <strong>Notes:</strong> {sale.notes}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-600">
                    <p className="mb-1">Thank you for your business!</p>
                    <p className="mb-1">Visit again!</p>
                    <p className="mb-2">---------------------------</p>
                    <p>Powered by Shop Management System</p>
                    <p>{new Date().toLocaleString('en-GB')}</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                        }
                        .receipt-container {
                            margin: 0 !important;
                            padding: 10px !important;
                            max-width: none !important;
                            width: 58mm !important;
                            font-size: 11px !important;
                            line-height: 1.2 !important;
                            box-shadow: none !important;
                            border: none !important;
                        }
                        @page {
                            size: 58mm auto;
                            margin: 0;
                        }
                    }

                    @media screen {
                        .receipt-container {
                            border: 1px solid #ddd;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            margin: 20px auto;
                        }
                    }
                `
            }} />
        </>
    );
};

export default Receipt;
