import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Plus, Search, Filter, TrendingDown, Package, DollarSign, Activity } from 'lucide-react';

interface FixedAsset {
    id: number;
    name: string;
    description: string | null;
    purchase_date: string;
    cost: number;
    depreciation_rate: number;
    accumulated_depreciation: number;
    current_value: number;
    status: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    data: FixedAsset[];
}

interface Summary {
    total_assets: number;
    active_assets: number;
    total_cost: number;
    total_depreciation: number;
    net_book_value: number;
}

interface Props {
    assets: Pagination;
    summary: Summary;
    filters: {
        search?: string;
        status?: string;
    };
    statuses: string[];
}

const FixedAssetsIndex: React.FC<Props> = ({ assets, summary, filters, statuses }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            '/fixed-assets',
            { search, status: status || undefined },
            { preserveState: true, replace: true }
        );
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            active: 'bg-green-100 text-green-800',
            disposed: 'bg-yellow-100 text-yellow-800',
            sold: 'bg-blue-100 text-blue-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout>
            <Head title="Fixed Assets" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Fixed Assets</h1>
                        <p className="text-gray-600 mt-1">Manage and track your fixed assets</p>
                    </div>
                    <Link
                        href="/fixed-assets/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Asset</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-5 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <Package className="w-8 h-8 text-indigo-600 mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{summary.total_assets}</p>
                        <p className="text-sm text-gray-500">Total Assets</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <Activity className="w-8 h-8 text-green-600 mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{summary.active_assets}</p>
                        <p className="text-sm text-gray-500">Active Assets</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.total_cost)}</p>
                        <p className="text-sm text-gray-500">Total Cost</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <TrendingDown className="w-8 h-8 text-yellow-600 mb-2" />
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.total_depreciation)}</p>
                        <p className="text-sm text-gray-500">Depreciation</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.net_book_value)}</p>
                        <p className="text-sm text-gray-500">Net Book Value</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map((s) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button
                                onClick={handleFilter}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Assets Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Asset Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Purchase Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Cost
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Depr. Rate
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Accumulated Depr.
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Book Value
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.data.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/fixed-assets/${asset.id}`}
                                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                {asset.name}
                                            </Link>
                                            {asset.description && (
                                                <p className="text-sm text-gray-600 mt-1">{asset.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(asset.purchase_date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            {formatCurrency(asset.cost)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                            {Number(asset.depreciation_rate).toFixed(2)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {formatCurrency(asset.accumulated_depreciation)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                                            {formatCurrency(asset.current_value)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}
                                            >
                                                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <Link
                                                href={`/fixed-assets/${asset.id}`}
                                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {assets.last_page > 1 && (
                        <div className="px-6 py-4 border-t bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing page {assets.current_page} of {assets.last_page}
                                </div>
                                <div className="flex space-x-2">
                                    {assets.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border hover:bg-gray-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default FixedAssetsIndex;
