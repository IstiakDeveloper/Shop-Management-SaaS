import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save } from 'lucide-react';

const FixedAssetsCreate: React.FC = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        purchase_date: new Date().toISOString().split('T')[0],
        cost: '',
        depreciation_rate: '',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/fixed-assets');
    };

    return (
        <AppLayout>
            <Head title="New Fixed Asset" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">New Fixed Asset</h1>
                        <p className="text-gray-600 mt-1">Add a new fixed asset to your inventory</p>
                    </div>
                    <Link
                        href="/fixed-assets"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Asset Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asset Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.name ? 'border-red-500' : ''
                                }`}
                                placeholder="e.g., Office Computer, Delivery Van"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Purchase Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.purchase_date}
                                onChange={(e) => setData('purchase_date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.purchase_date ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.purchase_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.purchase_date}</p>
                            )}
                        </div>

                        {/* Cost */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Cost <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.cost}
                                onChange={(e) => setData('cost', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.cost ? 'border-red-500' : ''
                                }`}
                                placeholder="0.00"
                            />
                            {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
                        </div>

                        {/* Depreciation Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Depreciation Rate (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.depreciation_rate}
                                onChange={(e) => setData('depreciation_rate', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.depreciation_rate ? 'border-red-500' : ''
                                }`}
                                placeholder="e.g., 20 for 20% per year"
                            />
                            {errors.depreciation_rate && (
                                <p className="mt-1 text-sm text-red-600">{errors.depreciation_rate}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Annual depreciation rate (e.g., 20% = ৳20 depreciation per ৳100)
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.status ? 'border-red-500' : ''
                                }`}
                            >
                                <option value="active">Active</option>
                                <option value="disposed">Disposed</option>
                                <option value="sold">Sold</option>
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.description ? 'border-red-500' : ''
                                }`}
                                placeholder="Optional description, serial number, or other details"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link href="/fixed-assets" className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Creating...' : 'Create Asset'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default FixedAssetsCreate;
