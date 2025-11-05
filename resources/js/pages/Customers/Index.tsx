import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    X,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    AlertCircle,
    ShoppingBag,
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    current_due: number;
    credit_limit: number;
    is_active: boolean;
    sales_count: number;
    total_sales_amount: number;
    total_due: number;
}

interface Props {
    customers: {
        data: Customer[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const CustomersIndex: React.FC<Props> = ({ customers, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customers', { search, status }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get('/customers');
    };

    const deleteCustomer = (id: number, name: string) => {
        if (confirm(`Delete customer "${name}"? This cannot be undone.`)) {
            router.delete(`/customers/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title="Customers" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                        <p className="text-gray-600 mt-1">Manage your customer database</p>
                    </div>
                    <Link
                        href="/customers/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Customer</span>
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, or email..."
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
                            <option value="">All Customers</option>
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

                {/* Customers Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total Sales
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total Due
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
                            {customers.data.length > 0 ? (
                                customers.data.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {customer.sales_count || 0} orders
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {customer.phone && (
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-medium">
                                                        {customer.sales_count || 0} orders
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {formatCurrency(customer.total_sales_amount || 0)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.total_due > 0 ? (
                                                <div className="flex items-center">
                                                    <DollarSign className="w-4 h-4 text-red-500 mr-1" />
                                                    <span className="font-medium text-red-600">
                                                        {formatCurrency(customer.total_due)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-green-600 font-medium">Paid</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    customer.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {customer.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={`/customers/${customer.id}`}
                                                    className="p-2 hover:bg-indigo-50 rounded-lg"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/customers/${customer.id}/edit`}
                                                    className="p-2 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteCustomer(customer.id, customer.name)}
                                                    className="p-2 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500 text-lg font-medium mb-2">No customers found</p>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Add your first customer to get started
                                        </p>
                                        <Link
                                            href="/customers/create"
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Customer
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {customers.data.length > 0 && customers.links && (
                        <div className="px-6 py-4 border-t flex justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {customers.data.length} of {customers.total}
                            </div>
                            <div className="flex space-x-2">
                                {customers.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded text-sm ${
                                            link.active ? 'bg-indigo-600 text-white' : 'bg-white border'
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

export default CustomersIndex;
