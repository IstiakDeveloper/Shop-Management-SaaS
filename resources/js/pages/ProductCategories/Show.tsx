import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Edit2, FolderOpen, Package, CheckCircle, AlertCircle } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    code: string | null;
    sale_price: number;
    unit: string;
    is_active: boolean;
}

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    products: Product[];
}

interface Props {
    category: Category;
}

const CategoryShow: React.FC<Props> = ({ category }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AppLayout>
            <Head title={category.name} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                        <p className="text-gray-600 mt-1">
                            {category.products.length} products in this category
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/product-categories"
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        <Link
                            href={`/product-categories/${category.id}/edit`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>

                {/* Category Info */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <FolderOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        category.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {category.is_active ? (
                                        <span className="flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            Inactive
                                        </span>
                                    )}
                                </span>
                            </div>
                            {category.description && (
                                <p className="text-gray-600 mb-4">{category.description}</p>
                            )}
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div>
                                    <span className="font-semibold text-gray-900">
                                        {category.products.length}
                                    </span>{' '}
                                    Products
                                </div>
                                <div>
                                    Created on{' '}
                                    {new Date(category.created_at).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products in Category */}
                {category.products.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Products</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {category.products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                        {product.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {product.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {product.code || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(product.sale_price)}
                                                <span className="text-gray-500 ml-1">
                                                    /{product.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        product.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No products in this category
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Add products and assign them to this category
                        </p>
                        <Link
                            href="/products/create"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Add Product
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default CategoryShow;
