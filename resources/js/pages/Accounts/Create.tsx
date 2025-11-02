import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {}

const AccountCreate: React.FC<Props> = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'fixed_asset',
        description: '',
        opening_balance: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/accounts');
    };

    return (
        <AppLayout>
            <Head title="Add Fixed Asset Account" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add Fixed Asset Account</h1>
                        <p className="text-gray-600 mt-1">Create a fixed asset account category</p>
                    </div>
                    <Link
                        href="/accounts"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="e.g., Vehicles, Buildings"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Opening Balance (Optional)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.opening_balance}
                                onChange={(e) => setData('opening_balance', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.opening_balance ? 'border-red-500' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.opening_balance && <p className="mt-1 text-sm text-red-600">{errors.opening_balance}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : ''}`}
                                placeholder="Account description"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link
                            href="/accounts"
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
                            <span>{processing ? 'Saving...' : 'Save Account'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default AccountCreate;
