import React, { useState, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import FlashMessage from '@/components/FlashMessage';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    DollarSign,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
    Warehouse,
    ShoppingBag,
    Building2,
    Briefcase,
    Calculator,
} from 'lucide-react';

interface MenuItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url, props } = usePage<any>();
    const user = props.auth?.user || { name: 'Admin User' };
    const bankBalance = props.bank_balance || 0;

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    const menuItems: MenuItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Stock', href: '/stock', icon: Warehouse },
        { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
        { name: 'Sales', href: '/sales', icon: ShoppingBag },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Vendors', href: '/vendors', icon: Building2 },
        { name: 'Bank', href: '/bank-transactions', icon: DollarSign },
        { name: 'Expenses', href: '/expenses', icon: TrendingUp },
        { name: 'Fixed Assets', href: '/fixed-assets', icon: Briefcase },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'Settings', href: '/settings/profile', icon: Settings },
    ];

    const isActive = (href: string) => {
        return url.startsWith(href);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } hidden md:flex flex-col bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white transition-all duration-300 ease-in-out shadow-2xl`}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700/50">
                    {sidebarOpen ? (
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">ShopFlow</h1>
                                <p className="text-xs text-indigo-200">Management System</p>
                            </div>
                        </Link>
                    ) : (
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg mx-auto">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-indigo-800">
                    {/* POS Button - Prominent */}
                    <Link
                        href="/sales/create"
                        className="flex items-center px-3 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group relative mb-3 font-medium"
                    >
                        <Calculator
                            className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                sidebarOpen ? 'mr-3' : 'mx-auto'
                            }`}
                        />
                        {sidebarOpen && (
                            <span className="font-medium">POS Terminal</span>
                        )}
                    </Link>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                                    active
                                        ? 'bg-white text-indigo-600 shadow-lg'
                                        : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white'
                                }`}
                            >
                                <Icon
                                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                        sidebarOpen ? 'mr-3' : 'mx-auto'
                                    }`}
                                />
                                {sidebarOpen && (
                                    <>
                                        <span className="font-medium">{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                                {!sidebarOpen && item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t border-indigo-700/50 p-4">
                    {sidebarOpen ? (
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user.name}</p>
                                <p className="text-xs text-indigo-200 truncate">Admin</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shadow-lg mx-auto mb-3">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`w-full flex items-center justify-center py-2 px-4 bg-indigo-700/50 hover:bg-indigo-700 rounded-lg transition-colors ${
                            !sidebarOpen && 'px-2'
                        }`}
                    >
                        {sidebarOpen ? (
                            <>
                                <ChevronDown className="w-4 h-4 mr-2 rotate-90" />
                                <span className="text-sm">Collapse</span>
                            </>
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white z-50 md:hidden transform transition-transform duration-300 shadow-2xl">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700/50">
                            <Link href="/" className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">ShopFlow</h1>
                                    <p className="text-xs text-indigo-200">Management</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 hover:bg-indigo-700/50 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            {/* POS Button for Mobile */}
                            <Link
                                href="/sales/create"
                                className="flex items-center px-3 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-3 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Calculator className="w-5 h-5 mr-3" />
                                <span>POS Terminal</span>
                            </Link>

                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-3 py-3 rounded-xl transition-all ${
                                            active
                                                ? 'bg-white text-indigo-600 shadow-lg'
                                                : 'text-indigo-100 hover:bg-indigo-700/50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        <span className="font-medium">{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 shadow-sm z-10">
                    <div className="h-full px-4 flex items-center justify-between">
                        {/* Left Side - Mobile Menu & App Title */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>

                            {/* App Title for Context */}
                            <div className="hidden sm:block">
                                <h2 className="text-lg font-semibold text-gray-800">Shop Management</h2>
                                <p className="text-xs text-gray-500">Complete Business Solution</p>
                            </div>
                        </div>

                        {/* Right Side Actions - Logical Order */}
                        <div className="flex items-center space-x-3">
                            {/* POS Button - Primary Action */}
                            <Link
                                href="/sales/create"
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 font-medium"
                            >
                                <Calculator className="w-5 h-5" />
                                <span className="hidden sm:inline">POS</span>
                            </Link>

                            {/* Bank Balance - Important Info */}
                            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-gray-600">Balance</p>
                                    <p className="text-sm font-bold text-green-700">{formatCurrency(bankBalance)}</p>
                                </div>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                                <Bell className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>

                            {/* User Profile */}
                            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                                <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                    {user.name.charAt(0)}
                                </div>
                            </div>

                            {/* Logout */}
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="hidden md:flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Logout</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="container mx-auto px-4 py-6 animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>

            {/* Flash Messages */}
            <FlashMessage />

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }

                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }

                .scrollbar-thin::-webkit-scrollbar-track {
                    background: rgba(79, 70, 229, 0.1);
                }

                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(79, 70, 229, 0.5);
                    border-radius: 3px;
                }

                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(79, 70, 229, 0.7);
                }
            `}</style>
        </div>
    );
};

export default AppLayout;
