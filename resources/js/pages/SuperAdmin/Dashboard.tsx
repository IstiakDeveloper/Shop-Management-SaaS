import React from 'react';
import { usePage, Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';

interface PageProps {
    stats: {
        total_tenants: number;
        active_tenants: number;
        total_subscriptions: number;
        active_subscriptions: number;
        total_revenue: number;
        monthly_revenue: number;
    };
    [key: string]: any;
}

const SuperAdminDashboard: React.FC = () => {
    const { stats } = usePage<PageProps>().props;

    // Provide default values to prevent undefined errors
    const safeStats = {
        total_tenants: stats?.total_tenants || 0,
        active_tenants: stats?.active_tenants || 0,
        total_subscriptions: stats?.total_subscriptions || 0,
        active_subscriptions: stats?.active_subscriptions || 0,
        total_revenue: stats?.total_revenue || 0,
        monthly_revenue: stats?.monthly_revenue || 0,
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '৳0';
        return `৳${amount.toLocaleString('en-BD')}`;
    };

    return (
        <SuperAdminLayout>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to Super Admin</h1>
                    <p className="text-blue-100 text-lg">System overview and management dashboard</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Tenants</h3>
                        <p className="text-3xl font-bold text-blue-600">{safeStats.total_tenants}</p>
                        <p className="text-sm text-gray-600 mt-1">{safeStats.active_tenants} active</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(safeStats.total_revenue)}</p>
                        <p className="text-sm text-gray-600 mt-1">This month: {formatCurrency(safeStats.monthly_revenue)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscriptions</h3>
                        <p className="text-3xl font-bold text-purple-600">{safeStats.total_subscriptions}</p>
                        <p className="text-sm text-gray-600 mt-1">{safeStats.active_subscriptions} active</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <h4 className="font-medium text-green-900">Database</h4>
                            <p className="text-sm text-green-700">Connected and healthy</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-medium text-blue-900">Application</h4>
                            <p className="text-sm text-blue-700">Running smoothly</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="font-medium text-purple-900">Users</h4>
                            <p className="text-sm text-purple-700">{safeStats.active_tenants} tenants online</p>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default SuperAdminDashboard;
