import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    bank_balance: number;
    transaction_types: string[];
    categories: string[];
}

const BankTransactionCreate: React.FC<Props> = ({ bank_balance, transaction_types, categories }) => {
    const [customCategories, setCustomCategories] = React.useState<string[]>([]);
    const [showCustomInput, setShowCustomInput] = React.useState(false);

    // Load custom categories from localStorage on component mount
    React.useEffect(() => {
        const savedCategories = localStorage.getItem('bank_transaction_custom_categories');
        if (savedCategories) {
            setCustomCategories(JSON.parse(savedCategories));
        }
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        type: 'credit',
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // Filter out 'other' and format categories
    const filteredCategories = categories.filter(cat => cat !== 'other');

    // Combine built-in and custom categories
    const allCategories = [...filteredCategories, ...customCategories];

    const formatCategoryName = (category: string) => {
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleCategoryChange = (value: string) => {
        if (value === 'custom') {
            setShowCustomInput(true);
            setData('category', '');
        } else {
            setShowCustomInput(false);
            setData('category', value);
        }
    };

    const handleCustomCategorySubmit = (customValue: string) => {
        if (customValue.trim() && !allCategories.includes(customValue.trim())) {
            const newCustomCategories = [...customCategories, customValue.trim()];
            setCustomCategories(newCustomCategories);
            // Save to localStorage
            localStorage.setItem('bank_transaction_custom_categories', JSON.stringify(newCustomCategories));
        }
        setData('category', customValue.trim());
        setShowCustomInput(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/bank-transactions');
    };

    return (
        <AppLayout>
            <Head title="Add Bank Transaction" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add Bank Transaction</h1>
                        <p className="text-gray-600 mt-1">Record a new transaction</p>
                    </div>
                    <Link
                        href="/bank-transactions"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">Current Balance: <span className="font-bold text-indigo-600">৳{bank_balance.toLocaleString()}</span></p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Transaction Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.type ? 'border-red-500' : ''}`}
                            >
                                {transaction_types.map((type) => (
                                    <option key={type} value={type}>
                                        {type.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={showCustomInput ? 'custom' : data.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.category ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select category</option>
                                {allCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {formatCategoryName(cat)}
                                    </option>
                                ))}
                                <option value="custom">Custom</option>
                            </select>
                            {showCustomInput && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        onChange={(e) => setData('category', e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleCustomCategorySubmit(data.category);
                                            }
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter custom category and press Enter"
                                        autoFocus
                                    />
                                </div>
                            )}
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.amount ? 'border-red-500' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            {data.amount && (
                                <p className="mt-1 text-sm text-gray-600">
                                    Balance after: ৳{(data.type === 'credit'
                                        ? bank_balance + parseFloat(data.amount || '0')
                                        : bank_balance - parseFloat(data.amount || '0')
                                    ).toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Transaction Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.transaction_date ? 'border-red-500' : ''}`}
                            />
                            {errors.transaction_date && <p className="mt-1 text-sm text-red-600">{errors.transaction_date}</p>}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : ''}`}
                                placeholder="Transaction description"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link
                            href="/bank-transactions"
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
                            <span>{processing ? 'Saving...' : 'Save Transaction'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default BankTransactionCreate;
