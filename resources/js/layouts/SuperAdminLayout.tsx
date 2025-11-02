import React, { useState, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import FlashMessage from '@/components/FlashMessage';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
    Shield,
    Users,
    TrendingUp,
    DollarSign,
    Database,
    Activity,
    Globe,
    Zap,
    BarChart3,
    Crown,
    AlertTriangle,
} from 'lucide-react';

interface MenuItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    color?: string;
}

interface SuperAdminLayoutProps {
    children: ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url, props } = usePage<any>();
    const user = props.auth?.user || { name: 'Super Admin' };
    const systemStats = props.system_stats || {};

    const menuItems: MenuItem[] = [
        { 
            name: 'Dashboard', 
            href: '/super-admin/dashboard', 
            icon: LayoutDashboard,
            color: 'from-blue-600 to-indigo-600'
        },
        { 
            name: 'Tenants', 
            href: '/super-admin/tenants', 
            icon: Building2,
            badge: systemStats.pending_tenants || 0,
            color: 'from-green-600 to-emerald-600'
        },
        { 
            name: 'Users', 
            href: '/super-admin/users', 
            icon: Users,
            color: 'from-purple-600 to-violet-600'
        },
        { 
            name: 'Subscriptions', 
            href: '/super-admin/subscriptions', 
            icon: CreditCard,
            badge: systemStats.expiring_subscriptions || 0,
            color: 'from-orange-600 to-amber-600'
        },
        { 
            name: 'Billing', 
            href: '/super-admin/billing', 
            icon: DollarSign,
            badge: systemStats.pending_payments || 0,
            color: 'from-red-600 to-rose-600'
        },
        { 
            name: 'Analytics', 
            href: '/super-admin/analytics', 
            icon: BarChart3,
            color: 'from-cyan-600 to-blue-600'
        },
        { 
            name: 'System Health', 
            href: '/super-admin/system', 
            icon: Activity,
            color: 'from-teal-600 to-green-600'
        },
        { 
            name: 'Reports', 
            href: '/super-admin/reports', 
            icon: FileText,
            color: 'from-slate-600 to-gray-600'
        },
        { 
            name: 'Settings', 
            href: '/super-admin/settings', 
            icon: Settings,
            color: 'from-indigo-600 to-purple-600'
        },
    ];

    const isActive = (href: string) => {
        return url.startsWith(href);
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside
                className={`${
                    sidebarOpen ? 'w-72' : 'w-20'
                } hidden md:flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white transition-all duration-300 ease-in-out shadow-2xl border-r border-gray-700`}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
                    {sidebarOpen ? (
                        <Link href="/super-admin/dashboard" className="flex items-center space-x-3 group">
                            <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                    SuperAdmin
                                </h1>
                                <p className="text-xs text-gray-300">System Control Panel</p>
                            </div>
                        </Link>
                    ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                    )}
                </div>

                {/* System Status Bar */}
                {sidebarOpen && (
                    <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 font-medium">System Online</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Database className="w-3 h-3" />
                                <span>DB: OK</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                    active
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                            >
                                <Icon
                                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                        sidebarOpen ? 'mr-4' : 'mx-auto'
                                    }`}
                                />
                                {sidebarOpen && (
                                    <>
                                        <span className="font-medium">{item.name}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                                {!sidebarOpen && item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse font-bold">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Quick Actions */}
                {sidebarOpen && (
                    <div className="px-4 py-3 border-t border-gray-700/50">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                href="/super-admin/system/backup"
                                className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                <Database className="w-4 h-4 mr-3" />
                                System Backup
                            </Link>
                            <Link
                                href="/super-admin/system/maintenance"
                                className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                <Zap className="w-4 h-4 mr-3" />
                                Maintenance Mode
                            </Link>
                        </div>
                    </div>
                )}

                {/* User Section */}
                <div className="border-t border-gray-700/50 p-4">
                    {sidebarOpen ? (
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user.name}</p>
                                <p className="text-xs text-yellow-300 font-medium">Super Administrator</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-sm shadow-lg mx-auto mb-3">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`w-full flex items-center justify-center py-2 px-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors ${
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
                    <aside className="fixed inset-y-0 left-0 w-72 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white z-50 md:hidden transform transition-transform duration-300 shadow-2xl">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
                            <Link href="/super-admin/dashboard" className="flex items-center space-x-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                        SuperAdmin
                                    </h1>
                                    <p className="text-xs text-gray-300">Control Panel</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 hover:bg-gray-700/50 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                                            active
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                : 'text-gray-300 hover:bg-gray-700/50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="w-5 h-5 mr-4" />
                                        <span className="font-medium">{item.name}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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
                    <div className="h-full px-6 flex items-center justify-between">
                        {/* Left Side - Mobile Menu & Admin Title */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>

                            {/* Admin Context */}
                            <div className="hidden sm:block">
                                <div className="flex items-center space-x-2">
                                    <Crown className="w-5 h-5 text-yellow-500" />
                                    <h2 className="text-lg font-bold text-gray-800">Super Admin Panel</h2>
                                </div>
                                <p className="text-xs text-gray-500">System Management & Control</p>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* System Health Indicator */}
                            <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-green-700">System Healthy</span>
                                </div>
                                <div className="text-xs text-green-600">
                                    <div>CPU: 23%</div>
                                    <div>Memory: 45%</div>
                                </div>
                            </div>

                            {/* Revenue Overview */}
                            <div className="hidden xl:flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-600">Monthly Revenue</p>
                                    <p className="text-sm font-bold text-blue-700">{formatCurrency(systemStats.monthly_revenue || 0)}</p>
                                </div>
                            </div>

                            {/* Alerts */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                                <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                {(systemStats.total_alerts || 0) > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                                        {systemStats.total_alerts > 9 ? '9+' : systemStats.total_alerts}
                                    </span>
                                )}
                            </button>

                            {/* Global Actions */}
                            <div className="hidden md:flex items-center space-x-2">
                                <Link
                                    href="/super-admin/system/maintenance"
                                    className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Maintenance</span>
                                </Link>
                            </div>

                            {/* User Profile */}
                            <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-gray-200">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                    <p className="text-xs text-yellow-600 font-medium">Super Administrator</p>
                                </div>
                                <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                    <Crown className="w-5 h-5 text-white" />
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
                    <div className="container mx-auto px-6 py-6 animate-fadeIn">
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

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }

                .scrollbar-thin::-webkit-scrollbar-track {
                    background: rgba(75, 85, 99, 0.1);
                }

                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(75, 85, 99, 0.5);
                    border-radius: 3px;
                }

                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(75, 85, 99, 0.7);
                }
            `}</style>
        </div>
    );
};

export default SuperAdminLayout;