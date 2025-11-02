import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft } from 'lucide-react';

interface Props {
    sale: any;
}

const SaleEdit: React.FC<Props> = ({ sale }) => {
    return (
        <AppLayout>
            <Head title="Edit Sale" />
            
            <div className="max-w-4xl mx-auto space-y-6 mt-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-900 mb-2">Edit Not Allowed</h1>
                    <p className="text-red-700 mb-4">
                        Sales cannot be edited as they automatically update stock and bank transactions.
                    </p>
                    <Link
                        href="/sales"
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sales
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
};

export default SaleEdit;
