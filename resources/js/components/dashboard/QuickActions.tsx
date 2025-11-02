import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  TrendingDown,
  Package,
  Users,
  FileText,
  Calculator,
  PlusCircle,
  BarChart3,
  DollarSign,
  Warehouse
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'New Sale',
    description: 'Record a new sales transaction',
    href: '/sales/create',
    icon: ShoppingCart,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'New Purchase',
    description: 'Create a purchase order',
    href: '/purchases/create',
    icon: TrendingDown,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Add Product',
    description: 'Add new product to inventory',
    href: '/products/create',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'New Customer',
    description: 'Register a new customer',
    href: '/customers/create',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    title: 'Stock Entry',
    description: 'Record stock adjustment',
    href: '/stock/create',
    icon: Warehouse,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    title: 'New Transaction',
    description: 'Record accounting entry',
    href: '/transactions/create',
    icon: Calculator,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    title: 'Financial Reports',
    description: 'View business reports',
    href: '/reports',
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  {
    title: 'Analytics',
    description: 'View business analytics',
    href: '/analytics',
    icon: BarChart3,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50'
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Frequently used actions and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                asChild
                className="h-auto p-4 flex-col gap-2 hover:shadow-md transition-all"
              >
                <Link href={action.href}>
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {action.description}
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface FinancialSummaryProps {
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netIncome: number;
}

export function FinancialSummary({
  cashBalance,
  accountsReceivable,
  accountsPayable,
  monthlyRevenue,
  monthlyExpenses,
  netIncome
}: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Summary
        </CardTitle>
        <CardDescription>
          Key financial indicators for this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cash Balance</span>
              <span className="text-sm font-medium">{formatCurrency(cashBalance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Accounts Receivable</span>
              <span className="text-sm font-medium">{formatCurrency(accountsReceivable)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Accounts Payable</span>
              <span className="text-sm font-medium text-red-600">{formatCurrency(accountsPayable)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Revenue</span>
              <span className="text-sm font-medium text-green-600">{formatCurrency(monthlyRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Expenses</span>
              <span className="text-sm font-medium text-red-600">{formatCurrency(monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm font-medium">Net Income</span>
              <span className={`text-sm font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertsNotificationsProps {
  alerts: Array<{
    id: number;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    action?: {
      label: string;
      href: string;
    };
    timestamp: string;
  }>;
}

export function AlertsNotifications({ alerts }: AlertsNotificationsProps) {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
        <CardDescription>
          Important updates and system alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{alert.title}</div>
                    <div className="text-xs mt-1">{alert.message}</div>
                  </div>
                  {alert.action && (
                    <Link
                      href={alert.action.href}
                      className="text-xs underline hover:no-underline ml-2"
                    >
                      {alert.action.label}
                    </Link>
                  )}
                </div>
                <div className="text-xs opacity-75 mt-2">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No alerts at this time
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
