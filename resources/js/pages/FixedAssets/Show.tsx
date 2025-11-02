import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeft,
    Edit2,
    Calendar,
    DollarSign,
    TrendingDown,
    Package,
    Activity,
    AlertCircle,
    Trash2,
} from 'lucide-react';

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
    created_at: string;
}

interface DepreciationInfo {
    annual_depreciation: number;
    monthly_depreciation: number;
    years_owned: number;
    book_value: number;
    is_fully_depreciated: boolean;
}

interface Props {
    asset: FixedAsset;
    depreciation_info: DepreciationInfo;
}

const FixedAssetsShow: React.FC<Props> = ({ asset, depreciation_info }) => {
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

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this asset?')) {
            router.delete(`/fixed-assets/${asset.id}`);
        }
    };

    const handleUpdateDepreciation = () => {
        const months = prompt('Enter number of months to depreciate (1-12):', '1');
        if (months && Number(months) >= 1 && Number(months) <= 12) {
            router.post(`/fixed-assets/${asset.id}/update-depreciation`, { months: Number(months) });
        }
    };

    const handleDispose = () => {
        if (confirm('Mark this asset as disposed?')) {
            router.post(`/fixed-assets/${asset.id}/dispose`);
        }
    };

    const handleSell = () => {
        if (confirm('Mark this asset as sold?')) {
            router.post(`/fixed-assets/${asset.id}/sell`);
        }
    };

    return (
        <AppLayout>
            <Head title={asset.name} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
                        <p className="text-gray-600 mt-1">
                            Purchased on {new Date(asset.purchase_date).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/fixed-assets"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        <Link
                            href={`/fixed-assets/${asset.id}/edit`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}>
                        {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    </span>
                    {depreciation_info.is_fully_depreciated && (
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            Fully Depreciated
                        </span>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(asset.cost)}</p>
                        <p className="text-sm text-gray-500">Original Cost</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingDown className="w-8 h-8 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(asset.accumulated_depreciation)}
                        </p>
                        <p className="text-sm text-gray-500">Total Depreciation</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(asset.current_value)}</p>
                        <p className="text-sm text-gray-500">Current Book Value</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{Number(asset.depreciation_rate).toFixed(2)}%</p>
                        <p className="text-sm text-gray-500">Annual Depr. Rate</p>
                    </div>
                </div>

                {/* Asset Information */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Asset Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                                <p className="mt-1 text-gray-900">
                                    {new Date(asset.purchase_date).toLocaleDateString('en-GB', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <label className="text-sm font-medium text-gray-500">Years Owned</label>
                                <p className="mt-1 text-gray-900">{depreciation_info.years_owned.toFixed(2)} years</p>
                            </div>
                        </div>

                        {asset.description && (
                            <div className="flex items-start space-x-3 md:col-span-2">
                                <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="mt-1 text-gray-900">{asset.description}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <label className="text-sm font-medium text-gray-500">Created At</label>
                                <p className="mt-1 text-gray-900">
                                    {new Date(asset.created_at).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Depreciation Details */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Depreciation Details</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Annual Depreciation</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(depreciation_info.annual_depreciation)}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Monthly Depreciation</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(depreciation_info.monthly_depreciation)}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Remaining Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(depreciation_info.book_value)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        {asset.status === 'active' && !depreciation_info.is_fully_depreciated && (
                            <button
                                onClick={handleUpdateDepreciation}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                            >
                                Update Depreciation
                            </button>
                        )}

                        {asset.status === 'active' && (
                            <>
                                <button
                                    onClick={handleDispose}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                >
                                    Mark as Disposed
                                </button>
                                <button
                                    onClick={handleSell}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Mark as Sold
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Asset</span>
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default FixedAssetsShow;
