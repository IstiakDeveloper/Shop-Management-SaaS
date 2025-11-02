import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface BusinessMetricsProps {
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  lowStockCount: number;
  revenueGrowth: number;
  customerGrowth: number;
}

export function BusinessMetrics({
  totalRevenue,
  totalCustomers,
  totalProducts,
  totalOrders,
  lowStockCount,
  revenueGrowth,
  customerGrowth,
}: BusinessMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {revenueGrowth >= 0 ? (
              <>
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">+{revenueGrowth}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                <span className="text-red-600">{revenueGrowth}%</span>
              </>
            )}
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {customerGrowth >= 0 ? (
              <>
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">+{customerGrowth}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                <span className="text-red-600">{customerGrowth}%</span>
              </>
            )}
            <span className="ml-1">growth</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <div className="flex items-center text-xs">
            {lowStockCount > 0 ? (
              <>
                <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                <span className="text-amber-600">{lowStockCount} low stock</span>
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">All stocked</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface SalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    day: string;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  const maxSales = Math.max(...data.map(d => d.sales));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Daily sales for the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-[80px]">
                <span className="text-sm font-medium">{item.day}</span>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
              <div className="flex-1 mx-3">
                <Progress
                  value={maxSales > 0 ? (item.sales / maxSales) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div className="text-right min-w-[80px]">
                <span className="text-sm font-medium">
                  ${item.sales.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface TopProductsProps {
  products: Array<{
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best performing products this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.total_quantity} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${product.total_revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No product sales data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentActivityProps {
  activities: Array<{
    id: number;
    type: 'sale' | 'purchase' | 'stock' | 'customer';
    description: string;
    amount?: number;
    timestamp: string;
  }>;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-green-600" />;
      case 'purchase':
        return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'stock':
        return <Package className="h-4 w-4 text-amber-600" />;
      case 'customer':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest business activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {activity.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                {activity.amount && (
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium">
                      ${activity.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
