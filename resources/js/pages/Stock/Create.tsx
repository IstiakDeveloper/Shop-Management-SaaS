import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Save } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    code: string;
    unit: string;
    category: { id: number; name: string } | null;
}

interface Props {
    products: Product[];
}

const StockCreate: React.FC<Props> = ({ products }) => {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        type: 'opening',
        quantity: '',
        purchase_price: '',
        entry_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stock');
    };

    return (
        <AppLayout>
            <Head title="Add Stock Entry" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add Stock Entry</h1>
                        <p className="text-gray-600 mt-1">Create opening stock or adjustment entry</p>
                    </div>
                    <Link
                        href="/stock"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.product_id}
                                onChange={(e) => setData('product_id', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.product_id ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select product</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.code}) - {product.category?.name || 'No Category'}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Entry Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.type ? 'border-red-500' : ''}`}
                            >
                                <option value="opening">Opening Stock</option>
                                <option value="adjustment">Adjustment</option>
                            </select>
                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Entry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.entry_date}
                                onChange={(e) => setData('entry_date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.entry_date ? 'border-red-500' : ''}`}
                            />
                            {errors.entry_date && <p className="mt-1 text-sm text-red-600">{errors.entry_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="1"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.quantity ? 'border-red-500' : ''}`}
                                placeholder="0"
                            />
                            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                            <p className="mt-1 text-sm text-gray-500">Use negative value for reduction</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Price (per unit)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.purchase_price}
                                onChange={(e) => setData('purchase_price', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.purchase_price ? 'border-red-500' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.purchase_price && <p className="mt-1 text-sm text-red-600">{errors.purchase_price}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.notes ? 'border-red-500' : ''}`}
                                placeholder="Reason for adjustment, remarks, etc..."
                            />
                            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link
                            href="/stock"
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
                            <span>{processing ? 'Saving...' : 'Save Entry'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default StockCreate;
