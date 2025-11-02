import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Building2,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    X,
    Phone,
    Mail,
    DollarSign,
    ShoppingCart,
} from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    current_due: number;
    opening_due: number;
    is_active: boolean;
    purchases_count: number;
}

interface Props {
    vendors: {
        data: Vendor[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const VendorsIndex: React.FC<Props> = ({ vendors, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/vendors', { search, status }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get('/vendors');
    };

    const deleteVendor = (id: number, name: string) => {
        if (confirm(`Delete vendor "${name}"? This cannot be undone.`)) {
            router.delete(`/vendors/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="Vendors" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
                        <p className="text-gray-600 mt-1">Manage your vendor database</p>
                    </div>
                    <Link
                        href="/vendors/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Vendor</span>
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, company, phone, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Vendors</option>
                            <option value="active">Active Only</option>
                            <option value="outstanding">With Outstanding</option>
                        </select>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                            Search
                        </button>
                        {(search || status) && (
                            <button type="button" onClick={clearFilters} className="px-4 py-2 border rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Vendors Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Vendor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Due Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Purchases
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {vendors.data.length > 0 ? (
                                vendors.data.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                    {vendor.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{vendor.name}</p>
                                                    {vendor.company_name && (
                                                        <p className="text-sm text-gray-500">{vendor.company_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {vendor.phone && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        {vendor.phone}
                                                    </div>
                                                )}
                                                {vendor.email && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {vendor.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <span className={`font-medium ${parseFloat(vendor.current_due.toString()) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {formatCurrency(parseFloat(vendor.current_due.toString()) || 0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{vendor.purchases_count || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    vendor.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {vendor.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={`/vendors/${vendor.id}`}
                                                    className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                </Link>
                                                <Link
                                                    href={`/vendors/${vendor.id}/edit`}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteVendor(vendor.id, vendor.name)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">No vendors found</p>
                                        <Link
                                            href="/vendors/create"
                                            className="inline-block mt-3 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                        >
                                            Add your first vendor
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {vendors.links && (
                        <div className="px-6 py-4 border-t flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Showing {vendors.data.length} of {vendors.total} vendors
                            </div>
                            <div className="flex space-x-2">
                                {vendors.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded text-sm ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white border hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default VendorsIndex;
