import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    Calendar,
    Activity,
    CreditCard,
    Building2,
    PackageCheck,
} from 'lucide-react';

interface DashboardProps {
    metrics: {
        sales: {
            current_month: number;
            last_month: number;
            growth_percentage: number;
        };
        purchases: {
            current_month: number;
        };
        customers: {
            total: number;
            new_this_month: number;
            total_due: number;
        };
        vendors: {
            total: number;
            total_due: number;
        };
        products: {
            total: number;
            low_stock: number;
        };
        financial: {
            cash_balance: number;
            revenue_this_month: number;
            total_stock_value: number;
        };
    };
    charts: {
        daily_sales: Array<{
            date: string;
            sales: number;
            day: string;
        }>;
        monthly_sales: Array<{
            month: string;
            sales: number;
            short_month: string;
        }>;
        top_products: Array<{
            name: string;
            total_quantity: number;
            total_revenue: number;
        }>;
    };
    alerts: {
        low_stock_products: Array<{
            id: number;
            product_id: number;
            total_qty: number;
            avg_purchase_price: number;
            total_value: number;
            product: {
                id: number;
                name: string;
                unit: string;
                low_stock_alert: number;
            };
        }>;
    };
    recent: {
        sales: Array<{
            id: number;
            invoice_number: string;
            sale_date: string;
            customer_name: string;
            total: number;
            paid: number;
            due: number;
            status: string;
        }>;
        purchases: Array<{
            id: number;
            invoice_number: string;
            purchase_date: string;
            vendor_name: string;
            total: number;
            paid: number;
            due: number;
            status: string;
        }>;
    };
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, charts, alerts, recent }) => {
    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('en-BD');
    };

    const getMaxSales = () => {
        const max = Math.max(...charts.daily_sales.map(d => d.sales));
        return max > 0 ? max : 1;
    };

    const getStockStatus = (current: number, alert: number) => {
        const percentage = (current / alert) * 100;
        if (percentage <= 50) return { color: 'text-red-600', bg: 'bg-red-100', status: 'Critical' };
        if (percentage <= 100) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Low' };
        return { color: 'text-green-600', bg: 'bg-green-100', status: 'Good' };
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            completed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            returned: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back! Here's your business overview
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/reports"
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <Activity className="w-4 h-4" />
                            <span>View Reports</span>
                        </Link>
                        <Link
                            href="/sales/create"
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>New Sale</span>
                        </Link>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Sales Card */}
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                            <div
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    metrics.sales.growth_percentage >= 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {metrics.sales.growth_percentage >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                <span>{Math.abs(metrics.sales.growth_percentage)}%</span>
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">This Month Sales</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            {formatCurrency(metrics.sales.current_month)}
                        </p>
                        <p className="text-xs text-gray-500">
                            Last month: {formatCurrency(metrics.sales.last_month)}
                        </p>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Revenue This Month</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            {formatCurrency(metrics.financial.revenue_this_month)}
                        </p>
                        <p className="text-xs text-gray-500">Total revenue collected</p>
                    </div>

                    {/* Customers Card */}
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Total Customers</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            {formatNumber(metrics.customers.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                            +{formatNumber(metrics.customers.new_this_month)} new this month
                        </p>
                    </div>

                    {/* Products Card */}
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-orange-600" />
                            </div>
                            {metrics.products.low_stock > 0 && (
                                <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{metrics.products.low_stock}</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Total Products</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            {formatNumber(metrics.products.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                            {metrics.products.low_stock > 0
                                ? `${metrics.products.low_stock} items low stock`
                                : 'All items in stock'}
                        </p>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Cash Balance Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Cash Balance</h3>
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold mb-2">
                            {formatCurrency(metrics.financial.cash_balance)}
                        </p>
                        <p className="text-indigo-100 text-sm">Available cash in hand</p>
                    </div>

                    {/* Stock Value Card */}
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Total Stock Value</h3>
                            <PackageCheck className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold mb-2">
                            {formatCurrency(metrics.financial.total_stock_value)}
                        </p>
                        <p className="text-green-100 text-sm">Current inventory value</p>
                    </div>

                    {/* Customer Due Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Customer Due</h3>
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold mb-2">
                            {formatCurrency(metrics.customers.total_due)}
                        </p>
                        <p className="text-blue-100 text-sm">
                            Receivable from {metrics.customers.total} customers
                        </p>
                    </div>

                    {/* Vendor Due Card */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Vendor Due</h3>
                            <Building2 className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold mb-2">
                            {formatCurrency(metrics.vendors.total_due)}
                        </p>
                        <p className="text-orange-100 text-sm">
                            Payable to {metrics.vendors.total} vendors
                        </p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Sales Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Last 7 Days Sales</h2>
                                <p className="text-sm text-gray-500 mt-1">Daily sales performance</p>
                            </div>
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="space-y-3">
                            {charts.daily_sales.map((day, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="w-20 text-sm font-medium text-gray-700">
                                        {day.date}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                    style={{
                                                        width: `${(day.sales / getMaxSales()) * 100}%`,
                                                    }}
                                                >
                                                    {day.sales > 0 && (
                                                        <span className="text-xs font-medium text-white">
                                                            ৳{formatNumber(day.sales)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 text-xs text-gray-500">{day.day}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Sales Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Monthly Sales Trend</h2>
                                <p className="text-sm text-gray-500 mt-1">Last 6 months comparison</p>
                            </div>
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="space-y-4">
                            {charts.monthly_sales.map((month, index) => {
                                const maxMonthlySales = Math.max(...charts.monthly_sales.map(m => m.sales));
                                const percentage = maxMonthlySales > 0 ? (month.sales / maxMonthlySales) * 100 : 0;
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">
                                                {month.short_month}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {formatCurrency(month.sales)}
                                            </span>
                                        </div>
                                        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Top Products & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Selling Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
                            <Link
                                href="/reports/products"
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                            >
                                View All
                                <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {charts.top_products.length > 0 ? (
                                charts.top_products.map((product, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Sold: {formatNumber(product.total_quantity)} units
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                {formatCurrency(product.total_revenue)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No sales data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Sales */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Sales</h2>
                            <Link
                                href="/sales"
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                            >
                                View All
                                <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recent.sales.length > 0 ? (
                                recent.sales.map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {sale.customer_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {sale.invoice_number || `#${sale.id}`}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(sale.sale_date).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(sale.total)}
                                            </p>
                                            {sale.due > 0 && (
                                                <p className="text-xs text-red-600">
                                                    Due: {formatCurrency(sale.due)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No sales yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                {alerts.low_stock_products.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
                                    <p className="text-sm text-gray-500">
                                        {alerts.low_stock_products.length} products need attention
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/stocks"
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                            >
                                Manage Stock
                                <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alerts.low_stock_products.map((item) => {
                                const status = getStockStatus(item.total_qty, item.product.low_stock_alert);
                                return (
                                    <div
                                        key={item.id}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 flex-1">
                                                {item.product.name}
                                            </h3>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                                            >
                                                {status.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Current Stock:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {item.total_qty} {item.product.unit}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Alert Level:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {item.product.low_stock_alert} {item.product.unit}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Avg Price:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(item.avg_purchase_price)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Link
                                                href={`/purchases/create?product_id=${item.product_id}`}
                                                className="block w-full text-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                            >
                                                Restock Now
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href="/sales/create"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all transform hover:scale-105 text-center"
                        >
                            <ShoppingCart className="w-6 h-6 mb-2 mx-auto" />
                            <p className="text-sm font-medium">New Sale</p>
                        </Link>
                        <Link
                            href="/purchases/create"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all transform hover:scale-105 text-center"
                        >
                            <Package className="w-6 h-6 mb-2 mx-auto" />
                            <p className="text-sm font-medium">New Purchase</p>
                        </Link>
                        <Link
                            href="/customers"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all transform hover:scale-105 text-center"
                        >
                            <Users className="w-6 h-6 mb-2 mx-auto" />
                            <p className="text-sm font-medium">Customers</p>
                        </Link>
                        <Link
                            href="/reports"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-all transform hover:scale-105 text-center"
                        >
                            <TrendingUp className="w-6 h-6 mb-2 mx-auto" />
                            <p className="text-sm font-medium">Reports</p>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
