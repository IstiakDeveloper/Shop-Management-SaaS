import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    X,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    code: string;
    category: { id: number; name: string; } | null;
    unit: string;
    sale_price: number;
    low_stock_alert: number;
    images: string[] | null;
    is_active: boolean;
    stock_summary: {
        total_qty: number;
        avg_purchase_price: number;
    } | null;
}

interface Props {
    products: {
        data: Product[];
        links: any[];
        total: number;
    };
    categories: Array<{ id: number; name: string }>;
    filters: { search?: string; category_id?: string; status?: string };
}

const ProductsIndex: React.FC<Props> = ({ products, categories, filters }) => {
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/products', { search, category_id: categoryId, status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        setStatus('');
        router.get('/products');
    };

    const deleteProduct = (id: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) {
            router.delete(`/products/${id}`);
        }
    };

    const getStockStatus = (product: Product) => {
        if (!product.stock_summary) return { text: 'No Stock', color: 'bg-gray-100 text-gray-700' };
        if (product.stock_summary.total_qty <= 0) return { text: 'Out', color: 'bg-red-100 text-red-700' };
        if (product.stock_summary.total_qty <= product.low_stock_alert) return { text: 'Low', color: 'bg-yellow-100 text-yellow-700' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-700' };
    };

    return (
        <AppLayout>
            <Head title="Products" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1">Manage your inventory</p>
                    </div>
                    <Link
                        href="/products/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                                Search
                            </button>
                            {(search || categoryId || status) && (
                                <button type="button" onClick={clearFilters} className="px-4 py-2 border rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="">All Categories</option>
                                    {categories?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        )}
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products?.data?.map((product) => {
                                const stockStatus = getStockStatus(product);
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                        {product.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    {product.code && <p className="text-sm text-gray-500">{product.code}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{product.category?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium">{Math.round(product.stock_summary?.total_qty || 0)} {product.unit}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${stockStatus.color}`}>{stockStatus.text}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">৳{product.sale_price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/products/${product.id}`} className="p-2 hover:bg-indigo-50 rounded-lg">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/products/${product.id}/edit`} className="p-2 hover:bg-blue-50 rounded-lg">
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => deleteProduct(product.id, product.name)} className="p-2 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {products?.links && (
                        <div className="px-6 py-4 border-t flex justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {products?.data?.length || 0} of {products?.total || 0}
                            </div>
                            <div className="flex space-x-2">
                                {products?.links?.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
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

export default ProductsIndex;
