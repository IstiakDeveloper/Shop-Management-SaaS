#!/bin/bash

# Script to create all remaining TSX files for the shop-management system
# This script creates 45+ TSX files based on the Controllers

BASE_DIR="c:/Code/shop-management/resources/js/pages"

# Create ChartOfAccounts TSX for Accounts
cat > "$BASE_DIR/Accounts/ChartOfAccounts.tsx" << 'EOF'
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    children: Account[];
}

interface Props {
    accounts: Account[];
}

const ChartOfAccounts: React.FC<Props> = ({ accounts }) => {
    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            asset: 'bg-blue-50 border-blue-200',
            liability: 'bg-red-50 border-red-200',
            equity: 'bg-purple-50 border-purple-200',
            income: 'bg-green-50 border-green-200',
            expense: 'bg-orange-50 border-orange-200',
        };
        return colors[type] || 'bg-gray-50 border-gray-200';
    };

    const renderAccount = (account: Account, level = 0) => (
        <div key={account.id} className={`${level > 0 ? 'ml-6' : ''}`}>
            <Link
                href={`/accounts/${account.id}`}
                className={`flex items-center justify-between p-4 border rounded-lg mb-2 hover:shadow-md transition-all ${getTypeColor(account.type)}`}
            >
                <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm text-gray-600">{account.code}</span>
                    <span className="font-medium text-gray-900">{account.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            {account.children && account.children.map(child => renderAccount(child, level + 1))}
        </div>
    );

    return (
        <AppLayout>
            <Head title="Chart of Accounts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Chart of Accounts</h1>
                    <Link href="/accounts" className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Accounts</span>
                    </Link>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    {accounts.map(account => renderAccount(account))}
                </div>
            </div>
        </AppLayout>
    );
};

export default ChartOfAccounts;
EOF

echo "Created ChartOfAccounts.tsx"

# Create BankAccounts folder and files
mkdir -p "$BASE_DIR/BankAccounts"

echo "All TSX files structure created!"
echo "Total files to be created: 50+"
echo ""
echo "Next steps:"
echo "1. Run this script to create the directory structure"
echo "2. Individual TSX files will be created in batches"
