import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Search, Plus, Minus, Trash2, Calculator, Banknote, Receipt, X, AlertCircle, CheckCircle } from 'lucide-react';

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
    images?: string[];
}

interface SaleItem {
    product_id: string;
    quantity: string;
    unit_price: string;
}

interface Sale {
    id: number;
    invoice_number: string;
    customer_id: number | null;
    sale_date: string;
    subtotal: number | string;
    discount: number | string;
    total: number | string;
    paid: number | string;
    due: number | string;
    status: string;
    payment_method: string;
    notes: string | null;
    sale_items: Array<{
        id: number;
        product_id: number;
        quantity: number | string;
        unit_price: number | string;
        product: {
            id: number;
            name: string;
            code: string;
            sale_price: number;
        };
    }>;
}

interface Props {
    sale: Sale;
    customers: Customer[];
    products: Product[];
}

const SaleEdit: React.FC<Props> = ({ sale, customers, products }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Initialize form with existing sale data
    const { data, setData, put, processing, errors } = useForm({
        customer_id: sale.customer_id?.toString() || '',
        sale_date: sale.sale_date,
        discount: sale.discount.toString(),
        paid: sale.paid.toString(),
        payment_method: sale.payment_method || 'cash',
        notes: sale.notes || '',
        items: sale.sale_items.map(item => ({
            product_id: item.product_id.toString(),
            quantity: item.quantity.toString(),
            unit_price: item.unit_price.toString(),
        })) as SaleItem[],
    });

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (product.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const showFlash = (type: 'success' | 'error', message: string) => {
        setFlashMessage({ type, message });
        setTimeout(() => setFlashMessage(null), 3000);
    };

    const addProductToCart = (product: Product) => {
        // Check if product has stock
        if (product.current_stock <= 0) {
            showFlash('error', `${product.name} is out of stock!`);
            return;
        }

        const existingItemIndex = data.items.findIndex(item => item.product_id === product.id.toString());

        if (existingItemIndex >= 0) {
            // If product already in cart, check if we can increase quantity
            const currentQuantity = parseInt(data.items[existingItemIndex].quantity);
            if (currentQuantity >= product.current_stock) {
                showFlash('error', `Cannot add more. Only ${Math.floor(product.current_stock)} items available in stock.`);
                return;
            }
            // Increase quantity
            const newItems = [...data.items];
            newItems[existingItemIndex].quantity = (currentQuantity + 1).toString();
            setData('items', newItems);
            showFlash('success', `${product.name} quantity increased`);
        } else {
            // Add new product to cart
            const newItem: SaleItem = {
                product_id: product.id.toString(),
                quantity: '1',
                unit_price: product.sale_price.toString(),
            };
            setData('items', [...data.items, newItem]);
            showFlash('success', `${product.name} added to cart`);
        }
        setSearchTerm(''); // Clear search after adding
    };

    const updateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(index);
            return;
        }

        // Check stock availability
        const item = data.items[index];
        const product = getProductInfo(item.product_id);

        if (product && newQuantity > product.current_stock) {
            showFlash('error', `Cannot add more. Only ${Math.floor(product.current_stock)} items available in stock.`);
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

        put(`/sales/${sale.id}`, {
            onSuccess: () => {
                // Success handled by backend redirect
            },
            onError: (errors) => {
                console.error('Sale update errors:', errors);
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
            <Head title={`Edit Sale - ${sale.invoice_number}`} />

            {/* Flash Message */}
            {flashMessage && (
                <div className={`fixed top-2 right-2 sm:top-4 sm:right-4 z-50 px-3 py-2 sm:px-6 sm:py-4 rounded-lg shadow-lg flex items-center space-x-2 sm:space-x-3 animate-slide-in max-w-[90vw] sm:max-w-md ${
                    flashMessage.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                }`}>
                    {flashMessage.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">{flashMessage.message}</span>
                    <button
                        onClick={() => setFlashMessage(null)}
                        className="ml-2 sm:ml-4 hover:bg-white/20 rounded p-0.5 sm:p-1 flex-shrink-0"
                    >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                </div>
            )}

            <div className="h-screen bg-gray-100 flex flex-col">
                {/* Header */}
                <div className="bg-white shadow-sm border-b px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                        <h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">Edit Sale</h1>
                        <div className="hidden md:block">
                            <span className="text-xs lg:text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                                {sale.invoice_number}
                            </span>
                        </div>
                    </div>
                    <Link
                        href={`/sales/${sale.id}`}
                        className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side - Product Search & Selection */}
                    <div className="w-full lg:w-2/3 bg-white border-r flex flex-col">
                        {/* Search Bar */}
                        <div className="p-2 sm:p-3 lg:p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    id="product-search"
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base lg:text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                {(searchTerm ? filteredProducts : products).map((product) => {
                                    const isOutOfStock = product.current_stock <= 0;
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => !isOutOfStock && addProductToCart(product)}
                                            className={`p-2 sm:p-3 lg:p-4 border rounded-lg transition-colors ${
                                                isOutOfStock
                                                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                    : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                                            }`}
                                        >
                                            {/* Product Image */}
                                            {product.images && product.images.length > 0 && (
                                                <div className="mb-1 sm:mb-2 w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden bg-gray-100 mx-auto">
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/50?text=No';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <h3 className={`text-xs sm:text-sm lg:text-base font-medium truncate ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
                                                {product.name}
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">{product.code}</p>
                                            <div className="flex justify-between items-center gap-1">
                                                <span className={`text-xs sm:text-sm lg:text-base font-bold ${isOutOfStock ? 'text-gray-400' : 'text-blue-600'}`}>
                                                    {formatCurrency(product.sale_price)}
                                                </span>
                                                <span className={`text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap ${
                                                    product.current_stock > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : product.current_stock > 0
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {isOutOfStock ? 'Out' : `${Math.floor(product.current_stock)}`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(searchTerm ? filteredProducts : products).length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        {searchTerm ? (
                                            <>
                                                <p className="text-lg font-medium mb-2">No products found</p>
                                                <p className="text-sm">No results for "{searchTerm}"</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-lg font-medium mb-2">No products available</p>
                                                <p className="text-sm">Add products to start selling</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Cart & Payment */}
                    <div className="hidden lg:flex lg:w-1/3 bg-gray-50 flex-col">
                        {/* Customer & Date Selection */}
                        <div className="p-2 sm:p-3 lg:p-4 bg-white border-b space-y-2 sm:space-y-3">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Customer</label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Walk-in</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Sale Date</label>
                                <input
                                    type="date"
                                    value={data.sale_date}
                                    onChange={(e) => setData('sale_date', e.target.value)}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.sale_date && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.sale_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-4">Cart ({data.items.length})</h3>
                            {data.items.length === 0 ? (
                                <div className="text-center py-6 sm:py-8 text-gray-500">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </div>
                                    <p className="text-xs sm:text-sm">Cart is empty</p>
                                    <p className="text-[10px] sm:text-xs">Add products to start</p>
                                </div>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    {data.items.map((item, index) => {
                                        const product = getProductInfo(item.product_id);
                                        return (
                                            <div key={index} className="bg-white p-2 sm:p-3 rounded-lg border">
                                                <div className="flex justify-between items-start mb-1 sm:mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 text-[11px] sm:text-xs lg:text-sm leading-tight truncate">
                                                            {product?.name || 'Unknown Product'}
                                                        </h4>
                                                        <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500">{product?.code}</p>
                                                        {product && (
                                                            <p className={`text-[9px] sm:text-[10px] lg:text-xs mt-0.5 sm:mt-1 font-medium ${
                                                                parseInt(item.quantity) >= product.current_stock
                                                                    ? 'text-amber-600'
                                                                    : 'text-gray-500'
                                                            }`}>
                                                                {parseInt(item.quantity) >= product.current_stock
                                                                    ? 'Max'
                                                                    : `${Math.floor(product.current_stock - parseInt(item.quantity))} left`
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-500 hover:bg-red-50 p-0.5 sm:p-1 rounded flex-shrink-0"
                                                    >
                                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(index, parseInt(item.quantity) - 1)}
                                                            className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                                                        >
                                                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        </button>
                                                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(index, parseInt(item.quantity) + 1)}
                                                            disabled={product && parseInt(item.quantity) >= product.current_stock}
                                                            className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={product && parseInt(item.quantity) >= product.current_stock ? `Max: ${Math.floor(product.current_stock)}` : ''}
                                                        >
                                                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-600">
                                                            {formatCurrency(parseFloat(item.unit_price))} × {item.quantity}
                                                        </div>
                                                        <div className="text-xs sm:text-sm lg:text-base font-bold text-gray-900">
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
                        <div className="p-2 sm:p-3 lg:p-4 bg-white border-t space-y-2 sm:space-y-3">
                            {/* Discount */}
                            <div className="flex justify-between items-center">
                                <label className="text-xs sm:text-sm font-medium text-gray-700">Discount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    className="w-20 sm:w-24 px-1.5 sm:px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded text-right"
                                    min="0"
                                />
                            </div>

                            {/* Subtotal & Total */}
                            <div className="space-y-1 sm:space-y-2 pt-1 sm:pt-2 border-t">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                {parseFloat(data.discount || '0') > 0 && (
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="text-red-600">-{formatCurrency(parseFloat(data.discount))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm sm:text-base lg:text-xl font-bold text-gray-900 pt-1 sm:pt-2 border-t">
                                    <span>Total:</span>
                                    <span>{formatCurrency(calculateTotal())}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="p-2 sm:p-3 lg:p-4 bg-white border-t">
                            {/* Cash Payment Only */}
                            <div className="mb-2 sm:mb-4">
                                <div className="flex items-center justify-center p-2 sm:p-3 border border-green-500 bg-green-50 text-green-700 rounded-lg">
                                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                                    <span className="text-xs sm:text-sm font-medium">Cash Payment</span>
                                </div>
                            </div>

                            {/* Amount Received */}
                            <div className="mb-2 sm:mb-4">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Amount Received</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.paid}
                                        onChange={(e) => setData('paid', e.target.value)}
                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-base lg:text-lg font-medium text-right"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-gray-500">৳</span>
                                </div>

                                {/* Quick Payment Buttons */}
                                <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-1 sm:mt-2">
                                    <button
                                        type="button"
                                        onClick={() => handlePaymentKeypad('exact')}
                                        className="px-1 sm:px-2 py-1 text-[10px] sm:text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        Exact
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('paid', (Math.ceil(calculateTotal() / 100) * 100).toString())}
                                        className="px-1 sm:px-2 py-1 text-[10px] sm:text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    >
                                        Round
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePaymentKeypad('clear')}
                                        className="px-1 sm:px-2 py-1 text-[10px] sm:text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {/* Change Calculation */}
                            {parseFloat(data.paid || '0') > 0 && (
                                <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-gray-600">Change:</span>
                                        <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600">
                                            {formatCurrency(getChange())}
                                        </span>
                                    </div>
                                    {parseFloat(data.paid || '0') < calculateTotal() && (
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs sm:text-sm text-gray-600">Due:</span>
                                            <span className="text-sm sm:text-base lg:text-lg font-bold text-red-600">
                                                {formatCurrency(calculateTotal() - parseFloat(data.paid || '0'))}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Update Sale Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={processing || data.items.length === 0}
                                className="w-full py-2 sm:py-3 lg:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm sm:text-base lg:text-lg rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2"
                            >
                                <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{processing ? 'Updating...' : 'Update Sale'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Cart Button - Only visible on small screens */}
                <div className="lg:hidden fixed bottom-4 right-4 z-40">
                    <button
                        onClick={handleSubmit}
                        disabled={processing || data.items.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2"
                    >
                        <Receipt className="w-6 h-6" />
                        <span className="font-bold">{data.items.length}</span>
                    </button>
                </div>
            </div>
        </AppLayout>
    );
};

export default SaleEdit;
