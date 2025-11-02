import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FolderOpen, Plus, Search, Edit2, Trash2, Eye, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    products_count: number;
    created_at: string;
}

interface Props {
    categories: {
        data: Category[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const ProductCategoriesIndex: React.FC<Props> = ({ categories, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/product-categories', { search, status }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get('/product-categories');
    };

    const deleteCategory = (id: number, name: string) => {
        if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
            router.delete(`/product-categories/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Product Categories" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
                        <p className="text-gray-600 mt-1">Organize your products</p>
                    </div>
                    <Link
                        href="/product-categories/create"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Category</span>
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
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
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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

                {/* Categories Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.data.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <FolderOpen className="w-6 h-6 text-white" />
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        category.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {category.is_active ? (
                                        <span className="flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Inactive
                                        </span>
                                    )}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                            {category.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {category.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">
                                        {category.products_count}
                                    </span>{' '}
                                    Products
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Link
                                        href={`/product-categories/${category.id}`}
                                        className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <Eye className="w-4 h-4 text-gray-600" />
                                    </Link>
                                    <Link
                                        href={`/product-categories/${category.id}/edit`}
                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                    </Link>
                                    <button
                                        onClick={() => deleteCategory(category.id, category.name)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {categories.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-600 mb-6">
                            Create your first category to organize products
                        </p>
                        <Link
                            href="/product-categories/create"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {categories.data.length > 0 && categories.links && (
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Showing {categories.data.length} of {categories.total}
                        </div>
                        <div className="flex space-x-2">
                            {categories.links.map((link, i) => (
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
        </AppLayout>
    );
};

export default ProductCategoriesIndex;
