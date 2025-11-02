import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Download, FileText, Printer } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    code: string;
    category: string;
    before_stock_qty: number | string;
    before_stock_price: number | string;
    before_stock_value: number | string;
    purchase_qty: number | string;
    purchase_price: number | string;
    purchase_total: number | string;
    sale_qty: number | string;
    sale_price: number | string;
    sale_subtotal: number | string;
    sale_discount: number | string;
    sale_total: number | string;
    profit_per_unit: number | string;
    profit_total: number | string;
    profit_margin: number | string;
    available_stock: number | string;
    available_stock_value: number | string;
}

interface Totals {
    total_purchase: number | string;
    total_sale: number | string;
    total_profit: number | string;
    profit_margin: number | string;
    stock_value: number | string;
}

interface Filters {
    start_date: string;
    end_date: string;
    search: string;
}

interface Props {
    products: Product[];
    totals: Totals;
    filters: Filters;
}

export default function ProductReport({ products, totals, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = (newSearchTerm?: string, newStartDate?: string, newEndDate?: string) => {
        const filterSearch = newSearchTerm !== undefined ? newSearchTerm : searchTerm;
        const filterStartDate = newStartDate || startDate;
        const filterEndDate = newEndDate || endDate;

        router.get('/reports/product-analysis', {
            search: filterSearch,
            start_date: filterStartDate,
            end_date: filterEndDate,
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        // Add a small delay for search to avoid too many requests
        setTimeout(() => {
            handleFilter(newSearchTerm, startDate, endDate);
        }, 500);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        handleFilter(searchTerm, newStartDate, endDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        handleFilter(searchTerm, startDate, newEndDate);
    };

    const handleExport = (type: 'excel' | 'pdf') => {
        if (type === 'pdf') {
            // Open PDF in new tab
            const params = new URLSearchParams({
                type,
                search: searchTerm,
                start_date: startDate,
                end_date: endDate,
            });
            window.open(`/reports/product-analysis/export?${params}`, '_blank');
        } else {
            // For Excel, use router.post as usual
            router.post('/reports/product-analysis/export', {
                type,
                search: searchTerm,
                start_date: startDate,
                end_date: endDate,
            });
        }
    };

    const formatCurrency = (amount: number | string | null | undefined) => {
        const numericAmount = Number(amount || 0);
        return new Intl.NumberFormat('en-BD', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    };

    const formatQuantity = (qty: number | string | null | undefined) => {
        const numericQty = Number(qty || 0);
        // Remove decimal places if it's a whole number
        return numericQty % 1 === 0 ? numericQty.toString() : numericQty.toFixed(2);
    };

    return (
        <AppLayout>
            <Head title="Product Analysis Report" />

            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Product Analysis Report</h1>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleExport('excel')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Excel
                            </Button>
                            <Button
                                onClick={() => handleExport('pdf')}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </div>
                    {/* Filter Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="search">Search Products</Label>
                                    <Input
                                        id="search"
                                        placeholder="Product name or code..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card className="bg-blue-50">
                            <CardContent className="p-4 text-center">
                                <h3 className="text-sm font-medium text-blue-600">Total Buy</h3>
                                <p className="text-2xl font-bold text-blue-800">
                                    {formatCurrency(totals.total_purchase)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-50">
                            <CardContent className="p-4 text-center">
                                <h3 className="text-sm font-medium text-green-600">Total Sale</h3>
                                <p className="text-2xl font-bold text-green-800">
                                    {formatCurrency(totals.total_sale)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-orange-50">
                            <CardContent className="p-4 text-center">
                                <h3 className="text-sm font-medium text-orange-600">Total Profit</h3>
                                <p className="text-2xl font-bold text-orange-800">
                                    {formatCurrency(totals.total_profit)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-purple-50">
                            <CardContent className="p-4 text-center">
                                <h3 className="text-sm font-medium text-purple-600">Profit Margin</h3>
                                <p className="text-2xl font-bold text-purple-800">
                                    {Number(totals.profit_margin || 0).toFixed(2)}%
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-50">
                            <CardContent className="p-4 text-center">
                                <h3 className="text-sm font-medium text-gray-600">Stock Value</h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    {formatCurrency(totals.stock_value)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th rowSpan={2} className="px-4 py-3 text-left border-r">SL</th>
                                            <th rowSpan={2} className="px-4 py-3 text-left border-r">NAME</th>
                                            <th colSpan={3} className="px-4 py-3 text-center border-r bg-blue-100">
                                                BEFORE STOCK INFORMATION
                                            </th>
                                            <th colSpan={3} className="px-4 py-3 text-center border-r bg-yellow-100">
                                                BUY INFORMATION
                                            </th>
                                            <th colSpan={5} className="px-4 py-3 text-center border-r bg-green-100">
                                                SALE INFORMATION
                                            </th>
                                            <th colSpan={2} className="px-4 py-3 text-center border-r bg-orange-100">
                                                PROFIT INFORMATION
                                            </th>
                                            <th colSpan={2} className="px-4 py-3 text-center bg-purple-100">
                                                AVAILABLE INFORMATION
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="px-2 py-2 text-center border-r text-xs">QTY</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">PRICE</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">VALUE</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">QTY</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">PRICE</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">TOTAL</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">QTY</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">PRICE</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">SUBTOTAL</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">DISCOUNT</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">TOTAL</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">PER UNIT</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">TOTAL</th>
                                            <th className="px-2 py-2 text-center border-r text-xs">STOCK</th>
                                            <th className="px-2 py-2 text-center text-xs">VALUE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, index) => (
                                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 border-r">{index + 1}</td>
                                                <td className="px-4 py-2 border-r">
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-xs text-gray-500">{product.code}</div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 text-center border-r">{formatQuantity(product.before_stock_qty)}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.before_stock_price || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.before_stock_value || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatQuantity(product.purchase_qty)}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.purchase_price || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.purchase_total || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatQuantity(product.sale_qty)}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.sale_price || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.sale_subtotal || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r text-red-600">{formatCurrency(Number(product.sale_discount || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.sale_total || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.profit_per_unit || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatCurrency(Number(product.profit_total || 0))}</td>
                                                <td className="px-2 py-2 text-center border-r">{formatQuantity(product.available_stock)}</td>
                                                <td className="px-2 py-2 text-center">{formatCurrency(Number(product.available_stock_value || 0))}</td>
                                            </tr>
                                        ))}
                                        {/* Totals Row */}
                                        {products.length > 0 && (
                                            <tr className="border-t-2 border-gray-800 bg-gray-100 font-bold">
                                                <td className="px-4 py-3 border-r" colSpan={2}>TOTAL</td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatQuantity(products.reduce((sum, p) => sum + Number(p.before_stock_qty || 0), 0))}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">-</td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatCurrency(products.reduce((sum, p) => sum + Number(p.before_stock_value || 0), 0))}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatQuantity(products.reduce((sum, p) => sum + Number(p.purchase_qty || 0), 0))}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">-</td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatCurrency(totals.total_purchase)}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatQuantity(products.reduce((sum, p) => sum + Number(p.sale_qty || 0), 0))}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">-</td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatCurrency(totals.total_sale)}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r text-red-600">
                                                    {formatCurrency(products.reduce((sum, p) => sum + Number(p.sale_discount || 0), 0))}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatCurrency(totals.total_sale)}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">-</td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatCurrency(totals.total_profit)}
                                                </td>
                                                <td className="px-2 py-3 text-center border-r">
                                                    {formatQuantity(products.reduce((sum, p) => sum + Number(p.available_stock || 0), 0))}
                                                </td>
                                                <td className="px-2 py-3 text-center">
                                                    {formatCurrency(totals.stock_value)}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {products.length === 0 && (
                        <Card className="mt-6">
                            <CardContent className="text-center py-8">
                                <p className="text-gray-500">No products found for the selected criteria.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
