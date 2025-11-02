import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save } from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
    company_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    opening_due: number;
    current_due: number;
    is_active: boolean;
}

interface Props {
    vendor: Vendor;
}

const VendorEdit: React.FC<Props> = ({ vendor }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: vendor.name,
        company_name: vendor.company_name || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        address: vendor.address || '',
        opening_due: vendor.opening_due.toString(),
        is_active: vendor.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/vendors/${vendor.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${vendor.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Vendor</h1>
                        <p className="text-gray-600 mt-1">{vendor.name}</p>
                    </div>
                    <Link
                        href="/vendors"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vendor Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.name ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input
                                type="text"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.company_name ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.phone ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.email ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Due Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.opening_due}
                                onChange={(e) => setData('opening_due', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                    errors.opening_due ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.opening_due && <p className="mt-1 text-sm text-red-600">{errors.opening_due}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                errors.address ? 'border-red-500' : ''
                            }`}
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>

                    {/* Current Due Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            Current Due:{' '}
                            <span className="font-bold text-gray-900">৳{Number(vendor.current_due || 0).toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            This is calculated automatically based on purchases and payments
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                            Active
                        </label>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link href="/vendors" className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Updating...' : 'Update Vendor'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default VendorEdit;
