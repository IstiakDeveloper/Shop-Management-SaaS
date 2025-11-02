import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Search, Filter, Plus, Eye, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';

interface StockItem {
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
    stockItems: {
        data: StockItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        category_id?: string;
        stock_status?: string;
    };
}

const StockIndex: React.FC<Props> = ({ stockItems, categories, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/stock', { search, category_id: categoryId, stock_status: stockStatus }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        setStockStatus('');
        router.get('/stock', {}, { preserveState: true });
    };

    const formatCurrency = (amount: number) => {
        // Handle NaN, null, undefined cases
        const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
        return `৳${validAmount.toLocaleString('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const getStockStatus = (current: number, alert: number) => {
        if (current <= 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock', icon: AlertTriangle };
        if (current <= alert) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Low Stock', icon: TrendingDown };
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock', icon: TrendingUp };
    };

    const totalValue = stockItems.data.reduce((sum, item) => {
        // Convert to number and handle NaN/null/undefined
        const itemValue = parseFloat(item.total_value?.toString() || '0') || 0;
        return sum + itemValue;
    }, 0);
    const lowStockCount = stockItems.data.filter(item => item.total_qty <= item.product.low_stock_alert).length;
    const outOfStockCount = stockItems.data.filter(item => item.total_qty <= 0).length;

    return (
        <AppLayout>
            <Head title="Stock Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
                        <p className="text-gray-600 mt-1">Track and manage your inventory</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/stock/low-stock"
                            className="px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 flex items-center space-x-2"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            <span>Low Stock Alerts</span>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stockItems.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Total Stock Value</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(totalValue)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Low Stock Items</p>
                        <p className="text-2xl font-bold mt-2">{lowStockCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
                        <p className="text-sm font-medium opacity-90">Out of Stock</p>
                        <p className="text-2xl font-bold mt-2">{outOfStockCount}</p>
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Search by product name or SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <select
                            value={stockStatus}
                            onChange={(e) => setStockStatus(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                        {(search || categoryId || stockStatus) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </form>

                {/* Stock Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Qty</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Alert Level</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stockItems.data.map((item) => {
                                    const status = getStockStatus(item.total_qty, item.product.low_stock_alert);
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/stock/${item.id}`}
                                                    className="text-indigo-600 hover:underline font-medium"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-sm text-gray-500">{item.product.sku}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {item.product.category?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                {Math.round(isNaN(item.total_qty) ? 0 : item.total_qty)} {item.product.unit}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                {Math.round(isNaN(item.product.low_stock_alert) ? 0 : item.product.low_stock_alert)} {item.product.unit}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">
                                                {formatCurrency(item.avg_purchase_price)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                {formatCurrency(item.total_value)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center space-x-1 ${status.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/stock/${item.id}`}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/stock/history/${item.product_id}`}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                        title="View History"
                                                    >
                                                        <Package className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {stockItems.last_page > 1 && (
                        <div className="px-6 py-4 border-t">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing page {stockItems.current_page} of {stockItems.last_page}
                                </p>
                                <div className="flex items-center space-x-2">
                                    {stockItems.current_page > 1 && (
                                        <button
                                            onClick={() => router.get(`/stock?page=${stockItems.current_page - 1}`)}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {stockItems.current_page < stockItems.last_page && (
                                        <button
                                            onClick={() => router.get(`/stock?page=${stockItems.current_page + 1}`)}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default StockIndex;
