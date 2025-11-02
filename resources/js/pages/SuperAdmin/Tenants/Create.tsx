import React, { useState } from 'react';
import { router, usePage, Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';

// TypeScript declarations removed - using direct URLs instead

interface SubscriptionPlan {
    id: number;
    name: string;
    monthly_price: number;
    yearly_price: number;
}

interface PageProps {
    subscriptionPlans: SubscriptionPlan[];
    [key: string]: any;
}

const CreateTenant: React.FC = () => {
    const { subscriptionPlans } = usePage<PageProps>().props;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        domain: '',
        create_subscription: false,
        subscription_plan_id: '',
        billing_cycle: 'monthly',
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post('/super-admin/tenants', formData, {
            onSuccess: () => {
                console.log('Tenant created successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <SuperAdminLayout>
            <Head title="Create New Tenant" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Tenant</h1>
                        <p className="text-gray-600">Add a new tenant to the system with optional subscription</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Domain
                                </label>
                                <input
                                    type="text"
                                    name="domain"
                                    value={formData.domain}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter full address"
                            />
                        </div>

                        {/* Subscription Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    name="create_subscription"
                                    checked={formData.create_subscription}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm font-medium text-gray-700">
                                    Create Subscription Plan
                                </label>
                            </div>

                            {formData.create_subscription && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subscription Plan
                                        </label>
                                        <select
                                            name="subscription_plan_id"
                                            value={formData.subscription_plan_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select a plan</option>
                                            {subscriptionPlans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name} - Monthly: ৳{plan.monthly_price} / Yearly: ৳{plan.yearly_price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Billing Cycle
                                        </label>
                                        <select
                                            name="billing_cycle"
                                            value={formData.billing_cycle}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.get('/super-admin/tenants')}
                                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Tenant'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Default Login Credentials</h3>
                        <p className="text-blue-800 text-sm">
                            Email: [tenant-email]<br />
                            Password: password123<br />
                            <span className="text-blue-600">Please ask tenant to change password on first login</span>
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-2">Automatic Setup</h3>
                        <p className="text-green-800 text-sm">
                            • Admin user will be created automatically<br />
                            • Default accounts will be set up<br />
                            • Basic system configuration applied
                        </p>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default CreateTenant;
