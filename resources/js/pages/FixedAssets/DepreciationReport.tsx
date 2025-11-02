import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, TrendingDown, FileText } from 'lucide-react';

interface FixedAsset {
    id: number;
    name: string;
    purchase_date: string;
    cost: number;
    depreciation_rate: number;
    accumulated_depreciation: number;
    current_value: number;
    status: string;
}

interface Props {
    assets: FixedAsset[];
    filters: {
        status?: string;
    };
}

const DepreciationReport: React.FC<Props> = ({ assets, filters }) => {
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            '/fixed-assets/depreciation-report',
            { status: status || undefined },
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

    const calculateAnnualDepreciation = (cost: number, rate: number) => {
        return (cost * rate) / 100;
    };

    const calculateMonthlyDepreciation = (cost: number, rate: number) => {
        return calculateAnnualDepreciation(cost, rate) / 12;
    };

    const totals = assets.reduce(
        (acc, asset) => ({
            cost: acc.cost + Number(asset.cost),
            accumulated: acc.accumulated + Number(asset.accumulated_depreciation),
            current: acc.current + Number(asset.current_value),
            annual: acc.annual + calculateAnnualDepreciation(Number(asset.cost), Number(asset.depreciation_rate)),
        }),
        { cost: 0, accumulated: 0, current: 0, annual: 0 }
    );

    return (
        <AppLayout>
            <Head title="Depreciation Report" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-indigo-600" />
                            <span>Depreciation Report</span>
                        </h1>
                        <p className="text-gray-600 mt-1">Comprehensive asset depreciation overview</p>
                    </div>
                    <Link
                        href="/fixed-assets"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Original Cost</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.cost)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Depreciation</p>
                        <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.accumulated)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm text-gray-500 mb-1">Net Book Value</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.current)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <p className="text-sm text-gray-500 mb-1">Annual Depreciation</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totals.annual)}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="disposed">Disposed</option>
                            <option value="sold">Sold</option>
                        </select>
                        <button
                            onClick={handleFilter}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Report Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Asset Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Purchase Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Original Cost
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Depr. Rate
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Annual Depr.
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Monthly Depr.
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Accumulated
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Book Value
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.map((asset) => {
                                    const annualDepr = calculateAnnualDepreciation(
                                        Number(asset.cost),
                                        Number(asset.depreciation_rate)
                                    );
                                    const monthlyDepr = calculateMonthlyDepreciation(
                                        Number(asset.cost),
                                        Number(asset.depreciation_rate)
                                    );
                                    return (
                                        <tr key={asset.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/fixed-assets/${asset.id}`}
                                                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    {asset.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                {new Date(asset.purchase_date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-right font-medium">
                                                {formatCurrency(Number(asset.cost))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-center">
                                                {Number(asset.depreciation_rate).toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-right">
                                                {formatCurrency(annualDepr)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-right">
                                                {formatCurrency(monthlyDepr)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-yellow-600 text-right font-semibold flex items-center justify-end space-x-1">
                                                <TrendingDown className="w-4 h-4" />
                                                <span>{formatCurrency(Number(asset.accumulated_depreciation))}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-green-600 text-right font-bold">
                                                {formatCurrency(Number(asset.current_value))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}
                                                >
                                                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-100 border-t-2">
                                <tr className="font-bold">
                                    <td className="px-6 py-4" colSpan={2}>
                                        TOTALS
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-900">
                                        {formatCurrency(totals.cost)}
                                    </td>
                                    <td className="px-6 py-4"></td>
                                    <td className="px-6 py-4 text-right text-gray-900">
                                        {formatCurrency(totals.annual)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-900">
                                        {formatCurrency(totals.annual / 12)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-yellow-600">
                                        {formatCurrency(totals.accumulated)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-600">
                                        {formatCurrency(totals.current)}
                                    </td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default DepreciationReport;
