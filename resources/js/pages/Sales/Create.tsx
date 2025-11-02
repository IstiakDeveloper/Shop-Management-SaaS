import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Search, Plus, Minus, Trash2, Calculator, Banknote, Receipt, X } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
    sale_price: number;
    current_stock: number;
}

interface SaleItem {
    product_id: string;
    quantity: string;
    unit_price: string;
}

interface Props {
    customers: Customer[];
    products: Product[];
}

const SaleCreate: React.FC<Props> = ({ customers, products }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        sale_date: new Date().toISOString().split('T')[0],
        discount: '0',
        paid: '',
        payment_method: 'cash',
        notes: '',
        items: [] as SaleItem[],
    });

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addProductToCart = (product: Product) => {
        const existingItemIndex = data.items.findIndex(item => item.product_id === product.id.toString());

        if (existingItemIndex >= 0) {
            // If product already in cart, increase quantity
            const newItems = [...data.items];
            newItems[existingItemIndex].quantity = (parseInt(newItems[existingItemIndex].quantity) + 1).toString();
            setData('items', newItems);
        } else {
            // Add new product to cart
            const newItem: SaleItem = {
                product_id: product.id.toString(),
                quantity: '1',
                unit_price: product.sale_price.toString(),
            };
            setData('items', [...data.items, newItem]);
        }
        setSearchTerm(''); // Clear search after adding
    };

    const updateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(index);
            return;
        }

        const newItems = [...data.items];
        newItems[index].quantity = newQuantity.toString();
        setData('items', newItems);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const calculateSubtotal = () => {
        return data.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity || '0') * parseFloat(item.unit_price || '0'));
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - parseFloat(data.discount || '0');
    };

    const getChange = () => {
        return Math.max(0, parseFloat(data.paid || '0') - calculateTotal());
    };

    const handlePaymentKeypad = (value: string) => {
        if (value === 'clear') {
            setData('paid', '');
        } else if (value === 'exact') {
            setData('paid', calculateTotal().toString());
        } else {
            setData('paid', (data.paid + value).replace(/^0+/, '') || '0');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.items.length === 0) {
            alert('Please add at least one item to the cart');
            return;
        }

        if (!data.paid || parseFloat(data.paid) === 0) {
            setData('paid', calculateTotal().toString());
        }

        post('/sales', {
            onSuccess: () => {
                // Success handled by backend redirect
            },
            onError: (errors) => {
                console.error('Sale creation errors:', errors);
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const getProductInfo = (productId: string) => {
        return products.find(p => p.id.toString() === productId);
    };

    // Auto-focus search input
    useEffect(() => {
        const searchInput = document.getElementById('product-search');
        if (searchInput) searchInput.focus();
    }, []);

    return (
        <AppLayout>
            <Head title="POS - New Sale" />

            <div className="h-screen bg-gray-100 flex flex-col">
                {/* Header */}
                <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-900">POS Terminal</h1>
                        <div className="text-sm text-gray-600">
                            {new Date().toLocaleDateString('en-BD', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                    <Link
                        href="/sales"
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Exit POS
                    </Link>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side - Product Search & Selection */}
                    <div className="w-2/3 bg-white border-r flex flex-col">
                        {/* Search Bar */}
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="product-search"
                                    type="text"
                                    placeholder="Search products... (All products shown below)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {(searchTerm ? filteredProducts : products).map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => addProductToCart(product)}
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                                    >
                                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{product.code}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-blue-600">
                                                {formatCurrency(product.sale_price)}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                product.current_stock > 10
                                                    ? 'bg-green-100 text-green-800'
                                                    : product.current_stock > 0
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                Stock: {product.current_stock}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {searchTerm && filteredProducts.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        No products found for "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Cart & Payment */}
                    <div className="w-1/3 bg-gray-50 flex flex-col">
                        {/* Customer Selection */}
                        <div className="p-4 bg-white border-b">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                            <select
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Walk-in Customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <h3 className="font-medium text-gray-900 mb-4">Cart Items ({data.items.length})</h3>
                            {data.items.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Receipt className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p>Cart is empty</p>
                                    <p className="text-sm">Add products to start a sale</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.items.map((item, index) => {
                                        const product = getProductInfo(item.product_id);
                                        return (
                                            <div key={index} className="bg-white p-3 rounded-lg border">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                                            {product?.name || 'Unknown Product'}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">{product?.code}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(index, parseInt(item.quantity) - 1)}
                                                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(index, parseInt(item.quantity) + 1)}
                                                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-600">
                                                            {formatCurrency(parseFloat(item.unit_price))} × {item.quantity}
                                                        </div>
                                                        <div className="font-bold text-gray-900">
                                                            {formatCurrency(parseFloat(item.quantity) * parseFloat(item.unit_price))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Total Section */}
                        <div className="p-4 bg-white border-t space-y-3">
                            {/* Discount */}
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">Discount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                                    min="0"
                                />
                            </div>

                            {/* Subtotal & Total */}
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                {parseFloat(data.discount || '0') > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="text-red-600">-{formatCurrency(parseFloat(data.discount))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                    <span>Total:</span>
                                    <span>{formatCurrency(calculateTotal())}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="p-4 bg-white border-t">
                            {/* Cash Payment Only */}
                            <div className="mb-4">
                                <div className="flex items-center justify-center p-3 border border-green-500 bg-green-50 text-green-700 rounded-lg">
                                    <Banknote className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Cash Payment</span>
                                </div>
                            </div>

                            {/* Amount Received */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.paid}
                                        onChange={(e) => setData('paid', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-medium text-right"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                                </div>

                                {/* Quick Payment Buttons */}
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => handlePaymentKeypad('exact')}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        Exact
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('paid', (Math.ceil(calculateTotal() / 100) * 100).toString())}
                                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    >
                                        Round ৳100
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePaymentKeypad('clear')}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {/* Change Calculation */}
                            {parseFloat(data.paid || '0') > 0 && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Change:</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {formatCurrency(getChange())}
                                        </span>
                                    </div>
                                    {parseFloat(data.paid || '0') < calculateTotal() && (
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-sm text-gray-600">Due:</span>
                                            <span className="text-lg font-bold text-red-600">
                                                {formatCurrency(calculateTotal() - parseFloat(data.paid || '0'))}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Complete Sale Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={processing || data.items.length === 0}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold text-lg rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <Calculator className="w-5 h-5" />
                                <span>{processing ? 'Processing...' : 'Complete Sale'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default SaleCreate;
