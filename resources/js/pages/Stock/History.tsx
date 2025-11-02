import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Search, TrendingUp, TrendingDown, FileText } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    unit: string;
}

interface StockEntry {
    id: number;
    type: string;
    quantity: number;
    balance_after: number;
    purchase_price: number | null;
    entry_date: string;
    notes: string | null;
    created_at: string;
}

interface Props {
    product: Product;
    entries: {
        data: StockEntry[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const StockHistory: React.FC<Props> = ({ product, entries }) => {
    const [searchDate, setSearchDate] = useState('');
    const [entryType, setEntryType] = useState('');

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getEntryTypeColor = (type: string) => {
        switch (type) {
            case 'opening': return 'bg-blue-100 text-blue-800';
            case 'adjustment': return 'bg-purple-100 text-purple-800';
            case 'purchase': return 'bg-green-100 text-green-800';
            case 'sale': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchDate) params.append('date', searchDate);
        if (entryType) params.append('type', entryType);
        window.location.href = `/stock/history/${product.id}?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearchDate('');
        setEntryType('');
        window.location.href = `/stock/history/${product.id}`;
    };

    return (
        <AppLayout>
            <Head title={`Stock History - ${product.name}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Stock History</h1>
                        <p className="text-gray-600 mt-1">{product.name} ({product.sku})</p>
                    </div>
                    <Link
                        href="/stock"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Stock</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Date</label>
                            <input
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
                            <select
                                value={entryType}
                                onChange={(e) => setEntryType(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Types</option>
                                <option value="opening">Opening Stock</option>
                                <option value="adjustment">Adjustment</option>
                                <option value="purchase">Purchase</option>
                                <option value="sale">Sale</option>
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

                {/* History Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                        <p className="text-sm text-gray-600 mt-1">Showing {entries.total} entries</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">In</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Out</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {entries.data.length > 0 ? (
                                    entries.data.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(entry.entry_date).toLocaleDateString('en-GB', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEntryTypeColor(entry.type)}`}>
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {entry.quantity > 0 ? (
                                                    <span className="text-green-600 font-medium flex items-center justify-end space-x-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>+{Math.round(entry.quantity)}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {entry.quantity < 0 ? (
                                                    <span className="text-red-600 font-medium flex items-center justify-end space-x-1">
                                                        <TrendingDown className="w-4 h-4" />
                                                        <span>{Math.round(Math.abs(entry.quantity))}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                {entry.balance_after} {product.unit}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">
                                                {entry.purchase_price ? formatCurrency(entry.purchase_price) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {entry.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                            <p>No stock history found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {entries.last_page > 1 && (
                        <div className="px-6 py-4 border-t flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing page {entries.current_page} of {entries.last_page}
                            </p>
                            <div className="flex items-center space-x-2">
                                {entries.current_page > 1 && (
                                    <Link
                                        href={`/stock/history/${product.id}?page=${entries.current_page - 1}`}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {entries.current_page < entries.last_page && (
                                    <Link
                                        href={`/stock/history/${product.id}?page=${entries.current_page + 1}`}
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

export default StockHistory;
