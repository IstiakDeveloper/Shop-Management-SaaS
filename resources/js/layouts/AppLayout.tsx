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
    ChevronRight,
    Warehouse,
    ShoppingBag,
    Building2,
    Briefcase,
    Calculator,
    FolderTree,
    CreditCard,
    Layers,
} from 'lucide-react';

interface SubMenuItem {
    name: string;
    href: string;
}

interface MenuItem {
    name: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    subItems?: SubMenuItem[];
}

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
    const { url, props } = usePage<any>();
    const user = props.auth?.user || { name: 'Admin User' };
    const permissions = props.auth?.permissions || {};
    const tenant = props.tenant || null;
    const bankBalance = props.bank_balance || 0;

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    };

    // Auto-expand dropdown if it contains active item
    React.useEffect(() => {
        const newOpenDropdowns: { [key: string]: boolean } = {};
        menuItems.forEach((item) => {
            if (item.subItems) {
                const hasActiveChild = item.subItems.some((subItem) => url.startsWith(subItem.href));
                if (hasActiveChild) {
                    newOpenDropdowns[item.name] = true;
                }
            }
        });
        setOpenDropdowns(newOpenDropdowns);
    }, [url]);

    // Build menu items based on user permissions
    const buildMenuItems = (): MenuItem[] => {
        const items: MenuItem[] = [];

        // Dashboard - Everyone can see
        if (permissions.canViewDashboard) {
            items.push({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
        }

        // Inventory - Admin, Manager only
        if (permissions.canManageInventory) {
            items.push({
                name: 'Inventory',
                icon: Package,
                subItems: [
                    { name: 'Products', href: '/products' },
                    { name: 'Product Categories', href: '/product-categories' },
                    { name: 'Stock Management', href: '/stock' },
                ],
            });
        }

        // Purchases - Admin, Manager only
        if (permissions.canManagePurchases) {
            items.push({
                name: 'Purchases',
                icon: ShoppingCart,
                subItems: [
                    { name: 'Purchase Orders', href: '/purchases' },
                    { name: 'Vendors', href: '/vendors' },
                ],
            });
        }

        // Sales - Everyone can see (includes POS)
        if (permissions.canManageSales) {
            items.push({
                name: 'Sales',
                icon: ShoppingBag,
                subItems: [
                    { name: 'Sales Orders', href: '/sales' },
                    { name: 'Customers', href: '/customers' },
                ],
            });
        }

        // Accounting - Admin, Manager only
        if (permissions.canManageAccounting) {
            items.push({
                name: 'Accounting',
                icon: DollarSign,
                subItems: [
                    { name: 'Accounts', href: '/accounts' },
                    { name: 'Bank Transactions', href: '/bank-transactions' },
                    { name: 'Expenses', href: '/expenses' },
                ],
            });
        }

        // Fixed Assets - Admin, Manager only
        if (permissions.canManageFixedAssets) {
            items.push({ name: 'Fixed Assets', href: '/fixed-assets', icon: Briefcase });
        }

        // Reports - Admin, Manager only
        if (permissions.canViewReports) {
            items.push({
                name: 'Reports',
                icon: FileText,
                subItems: [
                    { name: 'Balance Sheet', href: '/reports/balance-sheet-report' },
                    { name: 'Product Analysis', href: '/reports/product-analysis' },
                    { name: 'Receipt & Payment', href: '/reports/receipt-payment' },
                    { name: 'Income & Expenditure', href: '/reports/income-expenditure' },
                    { name: 'Bank Report', href: '/reports/bank-report' },
                ],
            });
        }

        // Settings - Show different based on role
        if (permissions.canManageSettings) {
            // Admin sees business profile
            items.push({ name: 'Settings', href: '/settings/tenant-profile', icon: Settings });
        } else {
            // Others see user profile
            items.push({ name: 'Settings', href: '/settings/profile', icon: Settings });
        }

        return items;
    };

    const menuItems = buildMenuItems();

    const toggleDropdown = (itemName: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [itemName]: !prev[itemName],
        }));
    };

    const isActive = (href: string) => {
        return url.startsWith(href);
    };

    const isParentActive = (subItems?: SubMenuItem[]) => {
        if (!subItems) return false;
        return subItems.some((subItem) => url.startsWith(subItem.href));
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } hidden md:flex flex-col bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white transition-all duration-300 ease-in-out shadow-2xl`}
            >
                {/* Logo Section - Tenant Branding */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700/50">
                    {sidebarOpen ? (
                        <Link href="/" className="flex items-center space-x-3 group">
                            {tenant?.logo ? (
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden transform group-hover:scale-110 transition-transform">
                                    <img
                                        src={`/storage/${tenant.logo}`}
                                        alt={tenant.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                    <Building2 className="w-6 h-6 text-indigo-600" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-bold tracking-tight truncate">
                                    {tenant?.name || 'ShopFlow'}
                                </h1>
                                <p className="text-xs text-indigo-200 truncate">
                                    {tenant?.business_type || 'Management System'}
                                </p>
                            </div>
                        </Link>
                    ) : (
                        tenant?.logo ? (
                            <div className="w-10 h-10 bg-white rounded-lg shadow-lg mx-auto overflow-hidden">
                                <img
                                    src={`/storage/${tenant.logo}`}
                                    alt={tenant.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg mx-auto">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                            </div>
                        )
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
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isOpen = openDropdowns[item.name];
                        const active = item.href ? isActive(item.href) : isParentActive(item.subItems);

                        if (hasSubItems) {
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => toggleDropdown(item.name)}
                                        className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                                            active
                                                ? 'bg-white/10 text-white'
                                                : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white'
                                        }`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 ${
                                                sidebarOpen ? 'mr-3' : 'mx-auto'
                                            }`}
                                        />
                                        {sidebarOpen && (
                                            <>
                                                <span className="font-medium flex-1 text-left text-sm">{item.name}</span>
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-200 ${
                                                        isOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </>
                                        )}
                                    </button>
                                    {sidebarOpen && isOpen && (
                                        <div className="ml-8 space-y-0.5 py-1 border-l-2 border-indigo-700/50 pl-3">
                                            {item.subItems?.map((subItem) => (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                                                        isActive(subItem.href)
                                                            ? 'bg-white text-indigo-600 font-medium shadow-sm'
                                                            : 'text-indigo-200 hover:bg-indigo-700/30 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="truncate">{subItem.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href!}
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

                {/* User & Tenant Section */}
                <div className="border-t border-indigo-700/50 p-4 space-y-3">
                    {sidebarOpen ? (
                        <>
                            {/* Tenant Contact Info */}
                            {tenant && (
                                <div className="bg-indigo-800/30 rounded-lg p-3 mb-2">
                                    <p className="text-xs font-semibold text-indigo-200 mb-1.5">Business Contact</p>
                                    {tenant.phone && (
                                        <p className="text-xs text-white mb-1 flex items-center">
                                            <span className="mr-1">📞</span>
                                            {tenant.phone}
                                        </p>
                                    )}
                                    {tenant.email && (
                                        <p className="text-xs text-white truncate flex items-center">
                                            <span className="mr-1">📧</span>
                                            {tenant.email}
                                        </p>
                                    )}
                                    {tenant.address && (
                                        <p className="text-xs text-indigo-200 mt-1.5 line-clamp-2">
                                            📍 {tenant.address}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* User Info */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-indigo-200 truncate">Administrator</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shadow-lg mx-auto">
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
                        {/* Mobile Header - Tenant Branding */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700/50">
                            <Link href="/" className="flex items-center space-x-3">
                                {tenant?.logo ? (
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-lg overflow-hidden">
                                        <img
                                            src={`/storage/${tenant.logo}`}
                                            alt={tenant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                        <Building2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg font-bold truncate">
                                        {tenant?.name || 'ShopFlow'}
                                    </h1>
                                    <p className="text-xs text-indigo-200 truncate">
                                        {tenant?.business_type || 'Management'}
                                    </p>
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
                                const hasSubItems = item.subItems && item.subItems.length > 0;
                                const isOpen = openDropdowns[item.name];
                                const active = item.href ? isActive(item.href) : isParentActive(item.subItems);

                                if (hasSubItems) {
                                    return (
                                        <div key={item.name} className="space-y-1">
                                            <button
                                                onClick={() => toggleDropdown(item.name)}
                                                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all ${
                                                    active
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-indigo-100 hover:bg-indigo-700/50'
                                                }`}
                                            >
                                                <Icon className="w-5 h-5 mr-3" />
                                                <span className="font-medium flex-1 text-left text-sm">{item.name}</span>
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-200 ${
                                                        isOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="ml-8 space-y-0.5 py-1 border-l-2 border-indigo-700/50 pl-3">
                                                    {item.subItems?.map((subItem) => (
                                                        <Link
                                                            key={subItem.href}
                                                            href={subItem.href}
                                                            className={`flex items-center px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                                                                isActive(subItem.href)
                                                                    ? 'bg-white text-indigo-600 font-medium shadow-sm'
                                                                    : 'text-indigo-200 hover:bg-indigo-700/30 hover:text-white'
                                                            }`}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            <span className="truncate">{subItem.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href!}
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

                            {/* Tenant Info Display */}
                            <div className="hidden sm:flex items-center space-x-3">
                                {tenant?.logo && (
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                                        <img
                                            src={`/storage/${tenant.logo}`}
                                            alt={tenant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {tenant?.name || 'Shop Management'}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {tenant?.business_type || 'Complete Business Solution'}
                                    </p>
                                </div>
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

                            {/* Tenant Quick Info (Mobile) */}
                            {tenant && (
                                <div className="hidden md:flex lg:hidden items-center px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                </div>
                            )}

                            {/* Bank Balance - Important Info */}
                            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-gray-600">Bank Balance</p>
                                    <p className="text-sm font-bold text-green-700">{formatCurrency(bankBalance)}</p>
                                </div>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                                <Bell className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>

                            {/* Tenant Settings Quick Link */}
                            {tenant && (
                                <Link
                                    href="/settings/tenant-profile"
                                    className="hidden xl:flex items-center space-x-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200"
                                    title="Business Profile Settings"
                                >
                                    <Building2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Business</span>
                                </Link>
                            )}

                            {/* User Profile */}
                            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {tenant?.name ? `${tenant.name}` : 'Administrator'}
                                    </p>
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
                    <div className="container mx-auto px-4 py-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Flash Messages */}
            <FlashMessage />

            <style>{`
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
