import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Package, TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';

interface StockEntry {
    id: number;
    type: string;
    quantity: number;
    purchase_price: number | null;
    entry_date: string;
    notes: string | null;
    created_at: string;
}

interface Stock {
    id: number;
    product_id: number;
    total_qty: number;
    avg_purchase_price: number;
    total_value: number;
    last_updated_at: string;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
        low_stock_alert: number;
        category: { id: number; name: string } | null;
    };
}

interface Props {
    stock: Stock;
    recentEntries: StockEntry[];
}

const StockShow: React.FC<Props> = ({ stock, recentEntries }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getStockStatus = () => {
        if (stock.total_qty <= 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' };
        if (stock.total_qty <= stock.product.low_stock_alert) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Low Stock' };
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
    };

    const status = getStockStatus();

    const getEntryTypeColor = (type: string) => {
        switch (type) {
            case 'opening': return 'bg-blue-100 text-blue-800';
            case 'adjustment': return 'bg-purple-100 text-purple-800';
            case 'purchase': return 'bg-green-100 text-green-800';
            case 'sale': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title={`Stock - ${stock.product.name}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{stock.product.name}</h1>
                        <p className="text-gray-600 mt-1">SKU: {stock.product.sku}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/stock"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        <Link
                            href={`/stock/history/${stock.product_id}`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Full History</span>
                        </Link>
                    </div>
                </div>

                {/* Stock Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600">Current Stock</p>
                            <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stock.total_qty}</p>
                        <p className="text-sm text-gray-500 mt-1">{stock.product.unit}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium opacity-90">Avg. Price</p>
                            <DollarSign className="w-5 h-5 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(stock.avg_purchase_price)}</p>
                        <p className="text-sm opacity-75 mt-1">per {stock.product.unit}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium opacity-90">Total Value</p>
                            <TrendingUp className="w-5 h-5 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(stock.total_value)}</p>
                        <p className="text-sm opacity-75 mt-1">inventory value</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600">Status</p>
                        </div>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                            Alert: {stock.product.low_stock_alert} {stock.product.unit}
                        </p>
                    </div>
                </div>

                {/* Product Information */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Information</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Category</p>
                            <p className="mt-1 text-gray-900">{stock.product.category?.name || 'Uncategorized'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Unit</p>
                            <p className="mt-1 text-gray-900">{stock.product.unit}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                            <p className="mt-1 text-gray-900">
                                {new Date(stock.last_updated_at).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Stock Entries */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Stock Entries</h2>
                        <Link
                            href={`/stock/history/${stock.product_id}`}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {recentEntries && recentEntries.length > 0 ? (
                                    recentEntries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(entry.entry_date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEntryTypeColor(entry.type)}`}>
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-right font-medium ${entry.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {entry.quantity >= 0 ? '+' : ''}{Math.round(entry.quantity)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                {entry.purchase_price ? formatCurrency(entry.purchase_price) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {entry.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No stock entries found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default StockShow;
