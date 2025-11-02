import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { AlertTriangle, Search, Package, TrendingDown, Eye, FileText } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    unit: string;
    low_stock_alert: number;
    category: { id: number; name: string } | null;
}

interface StockItem {
    id: number;
    product_id: number;
    total_qty: number;
    avg_purchase_price: number;
    total_value: number;
    product: Product;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    stockItems: {
        data: StockItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
}

const LowStock: React.FC<Props> = ({ stockItems, categories }) => {
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId) params.append('category', categoryId);
        window.location.href = `/stock/low-stock?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        window.location.href = '/stock/low-stock';
    };

    const getStockPercentage = (item: StockItem) => {
        const alert = item.product.low_stock_alert;
        if (alert === 0) return 0;
        return Math.round((item.total_qty / alert) * 100);
    };

    const getStockColor = (item: StockItem) => {
        const percentage = getStockPercentage(item);
        if (percentage === 0 || item.total_qty === 0) return 'bg-red-500';
        if (percentage <= 50) return 'bg-orange-500';
        return 'bg-yellow-500';
    };

    const totalLowStockValue = stockItems.data.reduce((sum, item) => sum + item.total_value, 0);
    const outOfStockCount = stockItems.data.filter(item => item.total_qty <= 0).length;

    return (
        <AppLayout>
            <Head title="Low Stock Alerts" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                            <AlertTriangle className="w-8 h-8 text-orange-500" />
                            <span>Low Stock Alerts</span>
                        </h1>
                        <p className="text-gray-600 mt-1">Products that need attention</p>
                    </div>
                    <Link
                        href="/stock"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <Package className="w-4 h-4" />
                        <span>All Stock</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium opacity-90">Low Stock Items</p>
                            <AlertTriangle className="w-5 h-5 opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">{stockItems.total}</p>
                        <p className="text-sm opacity-75 mt-1">Need reorder</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium opacity-90">Out of Stock</p>
                            <TrendingDown className="w-5 h-5 opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">{outOfStockCount}</p>
                        <p className="text-sm opacity-75 mt-1">Urgent action required</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium opacity-90">Total Value</p>
                            <Package className="w-5 h-5 opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">{formatCurrency(totalLowStockValue)}</p>
                        <p className="text-sm opacity-75 mt-1">Low stock inventory</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Product</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or SKU..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                            >
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Alert Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Level</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stockItems.data.length > 0 ? (
                                    stockItems.data.map((item) => {
                                        const percentage = getStockPercentage(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.product.name}</p>
                                                        <p className="text-sm text-gray-500">{item.product.sku}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {item.product.category?.name || 'Uncategorized'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-bold ${item.total_qty === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                                        {item.total_qty} {item.product.unit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-600">
                                                    {item.product.low_stock_alert} {item.product.unit}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className={`h-full ${getStockColor(item)} transition-all`}
                                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-600 w-12 text-right">
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-900">
                                                    {formatCurrency(item.avg_purchase_price)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                    {formatCurrency(item.total_value)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Link
                                                            href={`/stock/${item.id}`}
                                                            className="text-indigo-600 hover:text-indigo-700"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/stock/history/${item.product_id}`}
                                                            className="text-gray-600 hover:text-gray-700"
                                                            title="View History"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                            <p>No low stock items found - Great job!</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {stockItems.last_page > 1 && (
                        <div className="px-6 py-4 border-t flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing page {stockItems.current_page} of {stockItems.last_page}
                            </p>
                            <div className="flex items-center space-x-2">
                                {stockItems.current_page > 1 && (
                                    <Link
                                        href={`/stock/low-stock?page=${stockItems.current_page - 1}`}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {stockItems.current_page < stockItems.last_page && (
                                    <Link
                                        href={`/stock/low-stock?page=${stockItems.current_page + 1}`}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default LowStock;
