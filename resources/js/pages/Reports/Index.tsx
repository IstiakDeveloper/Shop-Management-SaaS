import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
    BarChart3,
    FileText,
    TrendingUp,
    Calculator,
    Building2,
    DollarSign,
    ArrowRight
} from 'lucide-react';

const ReportIndex: React.FC = () => {
    const newReports = [
        {
            title: 'Product Analysis Report',
            description: 'Comprehensive product-wise profit, stock, and sales analysis',
            icon: BarChart3,
            href: '/reports/product-analysis',
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Receipt & Payment Statement',
            description: 'Monthly cash flow statement showing receipts and payments',
            icon: FileText,
            href: '/reports/receipt-payment',
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Income & Expenditure Report',
            description: 'Monthly and cumulative income vs expenditure analysis',
            icon: TrendingUp,
            href: '/reports/income-expenditure',
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Balance Sheet Report',
            description: 'Assets vs liabilities financial position statement',
            icon: Calculator,
            href: '/reports/balance-sheet-report',
            color: 'from-orange-500 to-orange-600',
        },
        {
            title: 'Bank Report',
            description: 'Daily bank transaction statement with running balance',
            icon: Building2,
            href: '/reports/bank-report',
            color: 'from-red-500 to-red-600',
        },
    ];


    return (
        <AppLayout>
            <Head title="Financial Reports" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900">Financial Reports</h1>
                        <p className="text-gray-600 mt-2">Generate and view comprehensive business reports</p>
                    </div>

                    {/* New Detailed Reports */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Business Reports</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {newReports.map((report) => {
                                const Icon = report.icon;
                                return (
                                    <Link
                                        key={report.title}
                                        href={report.href}
                                        className="group"
                                    >
                                        <Card className="h-full hover:shadow-xl transition-all transform hover:-translate-y-1">
                                            <CardHeader>
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-14 h-14 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                        <Icon className="w-7 h-7 text-white" />
                                                    </div>
                                                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                                        {report.title}
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-600 text-sm mb-4">
                                                    {report.description}
                                                </p>
                                                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                                                    View Report
                                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>


                    {/* Quick Info */}
                    <Card className="mt-12">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">About Financial Reports</h3>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <p>
                                            <strong>Product Analysis:</strong> Shows detailed product performance with profit margins, stock levels, and sales data.
                                        </p>
                                        <p>
                                            <strong>Receipt & Payment:</strong> Monthly cash flow showing all money received and paid out.
                                        </p>
                                        <p>
                                            <strong>Income & Expenditure:</strong> Detailed breakdown of business income and expenses with cumulative totals.
                                        </p>
                                        <p>
                                            <strong>Balance Sheet:</strong> Snapshot of financial position - assets, liabilities, and equity.
                                        </p>
                                        <p>
                                            <strong>Bank Report:</strong> Daily bank transaction details with running balance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default ReportIndex;
