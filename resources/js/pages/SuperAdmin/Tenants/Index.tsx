import React, { useState } from 'react';
import { Link, router, usePage, Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import { Building2, Plus, Search, Filter, Eye, Users, ShoppingBag, TrendingUp, Crown, CheckCircle, XCircle, CreditCard } from 'lucide-react';

// TypeScript declarations removed - using direct URLs instead

interface Tenant {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone?: string;
    domain?: string;
    is_active: boolean;
    created_at: string;
    users_count: number;
    products_count: number;
    sales_count: number;
}

interface Stats {
    total_tenants: number;
    active_tenants: number;
    inactive_tenants: number;
    with_subscriptions: number;
}

interface PageProps {
    tenants: {
        data: Tenant[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
    };
    [key: string]: any;
}

const TenantsIndex: React.FC = () => {
    const { tenants, stats, filters } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/super-admin/tenants', {
            search: searchTerm,
            status: statusFilter,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <SuperAdminLayout>
            <Head title="Tenants Management" />

            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Tenants Management</h1>
                                <p className="text-sm text-gray-600">Manage all tenant accounts and subscriptions</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/super-admin/tenants/create"
                            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Tenant
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Tenants</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_tenants}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Active Tenants</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.active_tenants}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Inactive Tenants</p>
                                <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive_tenants}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">With Subscriptions</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.with_subscriptions}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Crown className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tenants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Apply Filters
                        </button>
                    </form>
                </div>

                {/* Tenants Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Tenant</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Stats</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Created</th>
                                    <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tenants.data.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">
                                                        {tenant.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{tenant.name}</p>
                                                    <p className="text-sm text-gray-500">/{tenant.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="text-sm text-gray-900">{tenant.email}</p>
                                                {tenant.phone && (
                                                    <p className="text-sm text-gray-500">{tenant.phone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                tenant.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {tenant.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{tenant.users_count}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <span>{tenant.products_count}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>{tenant.sales_count}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {formatDate(tenant.created_at)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                    <CreditCard className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {tenants.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenants found</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first tenant</p>
                        <Link
                            href="/super-admin/tenants/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Tenant
                        </Link>
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
};

export default TenantsIndex;
