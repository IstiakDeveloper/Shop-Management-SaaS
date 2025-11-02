import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Edit2, Package, TrendingUp, TrendingDown, Calendar, Image as ImageIcon } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    code: string | null;
    category: { id: number; name: string } | null;
    description: string | null;
    unit: string;
    sale_price: number;
    low_stock_alert: number;
    images: string[] | null;
    is_active: boolean;
    created_at: string;
    stock_summary: {
        total_qty: number;
        avg_purchase_price: number;
        total_value: number;
    } | null;
    stock_entries: Array<{
        id: number;
        type: string;
        quantity: number;
        purchase_price: number | null;
        sale_price: number | null;
        entry_date: string;
        notes: string | null;
    }>;
}

interface Props {
    product: Product;
}

const ProductShow: React.FC<Props> = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState(0);

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getStockStatus = () => {
        if (!product.stock_summary) return { text: 'No Stock', color: 'bg-gray-100 text-gray-700' };
        if (product.stock_summary.total_qty <= 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-700' };
        if (product.stock_summary.total_qty <= product.low_stock_alert) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-700' };
    };

    const stockStatus = getStockStatus();

    return (
        <AppLayout>
            <Head title={product.name} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        {product.code && <p className="text-gray-600 mt-1">Code: {product.code}</p>}
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/products"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        <Link
                            href={`/products/${product.id}/edit`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>

                {/* Product Images */}
                {product.images && product.images.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Product Images</h2>
                        <div className="space-y-4">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === index ? 'border-indigo-600' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Product Info Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Current Stock</h3>
                            <Package className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                            {product.stock_summary?.total_qty || 0} {product.unit}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                        </span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Stock Value</h3>
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                            {formatCurrency(product.stock_summary?.total_value || 0)}
                        </p>
                        <p className="text-sm text-gray-500">
                            Avg: {formatCurrency(product.stock_summary?.avg_purchase_price || 0)}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Sale Price</h3>
                            <TrendingDown className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                            {formatCurrency(product.sale_price)}
                        </p>
                        <p className="text-sm text-gray-500">Per {product.unit}</p>
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Category</label>
                            <p className="mt-1 text-gray-900">{product.category?.name || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Unit</label>
                            <p className="mt-1 text-gray-900">{product.unit}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Low Stock Alert</label>
                            <p className="mt-1 text-gray-900">{product.low_stock_alert} {product.unit}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className="mt-1">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                        {product.description && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-gray-900">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Stock Movements */}
                {product.stock_entries && product.stock_entries.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Stock Movements</h2>
                        <div className="space-y-3">
                            {product.stock_entries.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            entry.type === 'purchase' ? 'bg-green-100' :
                                            entry.type === 'sale' ? 'bg-red-100' : 'bg-blue-100'
                                        }`}>
                                            {entry.quantity > 0 ? (
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 capitalize">{entry.type}</p>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(entry.entry_date).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${entry.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {entry.quantity > 0 ? '+' : ''}{Math.round(entry.quantity)} {product.unit}
                                        </p>
                                        {entry.purchase_price && (
                                            <p className="text-sm text-gray-500">
                                                @ {formatCurrency(entry.purchase_price)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default ProductShow;
