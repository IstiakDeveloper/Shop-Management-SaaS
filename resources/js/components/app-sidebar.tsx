import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Package,
    Warehouse,
    ShoppingCart,
    Users,
    TrendingDown,
    Calculator,
    Banknote,
    FileText,
    UserCheck,
    Building,
    Settings,
    Tags,
    CreditCard,
    BarChart3
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Package,
        items: [
            { title: 'All Products', href: '/products' },
            { title: 'Categories', href: '/product-categories' },
        ]
    },
    {
        title: 'Stock',
        href: '/stock',
        icon: Warehouse,
    },
    {
        title: 'Purchases',
        href: '/purchases',
        icon: TrendingDown,
    },
    {
        title: 'Sales',
        href: '/sales',
        icon: ShoppingCart,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Vendors',
        href: '/vendors',
        icon: UserCheck,
    },
    {
        title: 'Accounting',
        href: '/accounts',
        icon: Calculator,
        items: [
            { title: 'Chart of Accounts', href: '/accounts' },
            { title: 'Transactions', href: '/transactions' },
            { title: 'Journal', href: '/journal' },
            { title: 'Trial Balance', href: '/trial-balance' },
        ]
    },
    {
        title: 'Banking',
        href: '/bank-accounts',
        icon: Banknote,
        items: [
            { title: 'Bank Accounts', href: '/bank-accounts' },
            { title: 'Bank Transactions', href: '/bank-transactions' },
        ]
    },
    {
        title: 'Fixed Assets',
        href: '/fixed-assets',
        icon: Building,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        items: [
            { title: 'Profit & Loss', href: '/reports/profit-and-loss' },
            { title: 'Balance Sheet', href: '/reports/balance-sheet-report' },
            { title: 'Cash Flow', href: '/reports/cash-flow' },
        ]
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/settings/tenant-profile',
        icon: Settings,
    },
    {
        title: 'Documentation',
        href: '#',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50">
            <SidebarHeader className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
