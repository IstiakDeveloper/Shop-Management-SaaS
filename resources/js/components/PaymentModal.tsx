import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, DollarSign } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleId: number;
    invoiceNumber: string;
    dueAmount: number;
    totalAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    saleId,
    invoiceNumber,
    dueAmount,
    totalAmount,
}) => {
    // Ensure amounts are properly parsed as numbers
    const parsedDueAmount = typeof dueAmount === 'string' ? parseFloat(dueAmount) : dueAmount;
    const parsedTotalAmount = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;

    // Debug log
    console.log('PaymentModal Props:', { dueAmount, totalAmount, parsedDueAmount, parsedTotalAmount });

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'cash',
        payment_reference: '',
    });

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/sales/${saleId}/payments`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Add Payment</h2>
                        <p className="text-sm text-gray-600 mt-1">Invoice: {invoiceNumber}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-xs font-medium text-blue-600 uppercase mb-1">Total Amount</p>
                            <p className="text-xl font-bold text-blue-900">{formatCurrency(parsedTotalAmount)}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <p className="text-xs font-medium text-orange-600 uppercase mb-1">Due Amount</p>
                            <p className="text-xl font-bold text-orange-900">{formatCurrency(parsedDueAmount)}</p>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                ৳
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="0.00"
                                max={parsedDueAmount}
                                required
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                        )}
                        <div className="mt-2 flex gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => {
                                    const fullAmount = parsedDueAmount.toFixed(2);
                                    setData('amount', fullAmount);
                                }}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                                Pay Full Due ({formatCurrency(parsedDueAmount)})
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const halfAmount = (parsedDueAmount / 2).toFixed(2);
                                    setData('amount', halfAmount);
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                                Pay Half ({formatCurrency(parsedDueAmount / 2)})
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.payment_method}
                            onChange={(e) => setData('payment_method', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="mobile">Mobile Banking</option>
                            <option value="bank">Bank Transfer</option>
                        </select>
                        {errors.payment_method && (
                            <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
                        )}
                    </div>

                    {/* Payment Reference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Reference (Optional)
                        </label>
                        <input
                            type="text"
                            value={data.payment_reference}
                            onChange={(e) => setData('payment_reference', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Transaction ID, Check number, etc."
                        />
                        {errors.payment_reference && (
                            <p className="mt-1 text-sm text-red-600">{errors.payment_reference}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={processing || !data.amount}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2 transition-colors"
                        >
                            <DollarSign className="w-5 h-5" />
                            <span>{processing ? 'Processing...' : 'Add Payment'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={processing}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
