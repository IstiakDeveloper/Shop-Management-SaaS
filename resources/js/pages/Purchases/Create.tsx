import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
    sale_price: number;
}

interface PurchaseItem {
    product_id: string;
    quantity: string;
    unit_price: string;
    use_total_price?: boolean;
    total_price?: string;
}

interface Props {
    vendors: Vendor[];
    products: Product[];
}

const PurchaseCreate: React.FC<Props> = ({ vendors, products }) => {
    const { data, setData, post, processing, errors } = useForm({
        vendor_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        due_date: '',
        reference_number: '',
        paid_amount: '',
        notes: '',
        items: [{ product_id: '', quantity: '1', unit_price: '0', use_total_price: true, total_price: '0' }] as PurchaseItem[],
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', quantity: '1', unit_price: '0', use_total_price: true, total_price: '0' }]);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: keyof PurchaseItem, value: string | boolean) => {
        const newItems = [...data.items];
        (newItems[index] as any)[field] = value;

        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product) {
                // Set purchase price as 80% of sale price as a starting point
                newItems[index].unit_price = (product.sale_price * 0.8).toString();
                newItems[index].total_price = (parseFloat(newItems[index].quantity) * product.sale_price * 0.8).toString();
            }
        }

        // Calculate unit price from total price
        if (field === 'total_price' && newItems[index].use_total_price) {
            const qty = parseFloat(newItems[index].quantity || '0');
            const totalPrice = parseFloat(value as string || '0');
            if (qty > 0) {
                newItems[index].unit_price = (totalPrice / qty).toString();
            }
        }

        // Calculate total price from unit price
        if ((field === 'unit_price' || field === 'quantity') && !newItems[index].use_total_price) {
            const qty = parseFloat(newItems[index].quantity || '0');
            const unitPrice = parseFloat(newItems[index].unit_price || '0');
            newItems[index].total_price = (qty * unitPrice).toString();
        }

        // Recalculate when quantity changes in total price mode
        if (field === 'quantity' && newItems[index].use_total_price) {
            const qty = parseFloat(value as string || '0');
            const totalPrice = parseFloat(newItems[index].total_price || '0');
            if (qty > 0) {
                newItems[index].unit_price = (totalPrice / qty).toString();
            }
        }

        setData('items', newItems);
    };

    const togglePriceMode = (index: number) => {
        const newItems = [...data.items];
        newItems[index].use_total_price = !newItems[index].use_total_price;
        setData('items', newItems);
    };

    const calculateSubtotal = () => {
        return data.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity || '0') * parseFloat(item.unit_price || '0'));
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/purchases');
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="New Purchase" />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">New Purchase</h1>
                        <p className="text-gray-600 mt-1">Auto-completes with stock & bank debit</p>
                    </div>
                    <Link
                        href="/purchases"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Simple:</strong> Product will be received and added to stock immediately. Bank account will be debited for paid amount. Any due will be tracked against vendor.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Purchase Information */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vendor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.vendor_id}
                                    onChange={(e) => setData('vendor_id', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.vendor_id ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select vendor</option>
                                    {vendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.id}>
                                            {vendor.name} - {vendor.phone}
                                        </option>
                                    ))}
                                </select>
                                {errors.vendor_id && <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purchase Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) => setData('purchase_date', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.purchase_date ? 'border-red-500' : ''}`}
                                />
                                {errors.purchase_date && <p className="mt-1 text-sm text-red-600">{errors.purchase_date}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                                <input
                                    type="text"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="PO-001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Purchase Items */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Purchase Items</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="grid md:grid-cols-12 gap-4 items-start p-4 bg-gray-50 rounded-lg">
                                    <div className="md:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={item.product_id}
                                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select product</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} ({product.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            min="1"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {item.use_total_price ? 'Total Price' : 'Unit Price'} <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => togglePriceMode(index)}
                                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                {item.use_total_price ? 'Unit' : 'Total'}
                                            </button>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.use_total_price ? item.total_price : item.unit_price}
                                            onChange={(e) => updateItem(index, item.use_total_price ? 'total_price' : 'unit_price', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            min="0"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {item.use_total_price ? 'Unit Price' : 'Total'}
                                        </label>
                                        <div className="px-4 py-2 bg-gray-200 rounded-lg font-medium text-sm">
                                            {item.use_total_price
                                                ? formatCurrency(parseFloat(item.unit_price || '0'))
                                                : formatCurrency(parseFloat(item.quantity || '0') * parseFloat(item.unit_price || '0'))
                                            }
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex items-end justify-center">
                                        {data.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errors.items && <p className="mt-2 text-sm text-red-600">{errors.items}</p>}
                    </div>

                    {/* Summary & Notes */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Additional notes or terms..."
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Paid Amount (Leave empty for full payment)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.paid_amount}
                                        onChange={(e) => setData('paid_amount', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Leave empty to pay full"
                                        min="0"
                                        max={calculateSubtotal()}
                                    />
                                    {data.paid_amount && parseFloat(data.paid_amount) < calculateSubtotal() && (
                                        <p className="mt-1 text-sm text-orange-600">
                                            Due: {formatCurrency(calculateSubtotal() - parseFloat(data.paid_amount))} (will be added to vendor balance)
                                        </p>
                                    )}
                                    {!data.paid_amount && (
                                        <p className="mt-1 text-sm text-green-600">
                                            Full amount will be paid from bank
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="text-xl font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-indigo-600">{formatCurrency(calculateSubtotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 bg-white rounded-xl shadow-sm border p-6">
                        <Link
                            href="/purchases"
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Creating...' : 'Create Purchase'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default PurchaseCreate;
