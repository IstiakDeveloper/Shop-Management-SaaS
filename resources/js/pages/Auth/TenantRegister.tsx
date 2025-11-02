import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    User, Mail, Lock, Eye, EyeOff, Store, Phone, MapPin,
    Building, CheckCircle, Crown, Star, ArrowRight, CreditCard,
    Calendar, DollarSign, Package, Users, BarChart3, Shield,
    Zap, Globe, Clock, ArrowLeft, TrendingUp
} from 'lucide-react';interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    features: string[];
    max_users: number;
    max_products: number;
    max_customers: number;
    max_vendors: number;
    multi_location: boolean;
    advanced_reports: boolean;
    api_access: boolean;
    priority_support: boolean;
    yearly_savings: number;
    savings_percentage: number;
}

interface TenantRegisterProps {
    subscriptionPlans: SubscriptionPlan[];
}

const TenantRegister: React.FC<TenantRegisterProps> = ({ subscriptionPlans }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
        subscriptionPlans.find(plan => plan.slug === 'professional') || subscriptionPlans[0] || null
    );
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        shop_name: '',
        phone: '',
        address: '',
        business_type: 'retail',
        subscription_plan_id: selectedPlan?.id || 0,
        billing_cycle: billingCycle,
    });

    // Update form data when plan or billing cycle changes
    React.useEffect(() => {
        setData(prev => ({
            ...prev,
            subscription_plan_id: selectedPlan?.id || 0,
            billing_cycle: billingCycle,
        }));
    }, [selectedPlan, billingCycle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tenant-register');
    };

    const getPrice = (plan: SubscriptionPlan) => {
        return billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const businessTypes = [
        { value: 'retail', label: 'Retail Store' },
        { value: 'wholesale', label: 'Wholesale Business' },
        { value: 'restaurant', label: 'Restaurant/Food Service' },
        { value: 'service', label: 'Service Business' },
        { value: 'other', label: 'Other' },
    ];

    const steps = [
        { id: 1, name: 'Plan Selection', icon: Package },
        { id: 2, name: 'Business Details', icon: Store },
        { id: 3, name: 'Account Setup', icon: User },
    ];

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <>
            <Head title="Create Your Shop Account" />

            {/* Full width layout */}
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                {/* Header with back button */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Login
                            </Link>

                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">ShopFlow</h1>
                                    <p className="text-xs text-gray-600">Management System</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Create Your Shop Account</h1>
                    <p className="text-gray-600 mt-2">
                        Choose your plan and get started with your shop management system
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        isActive
                                            ? 'bg-indigo-600 text-white'
                                            : isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>
                                <span
                                    className={`ml-2 text-sm font-medium ${
                                        isActive ? 'text-indigo-600' : 'text-gray-500'
                                    }`}
                                >
                                    {step.name}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className="w-8 h-px bg-gray-300 mx-4"></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Plan Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* Billing Toggle */}
                            <div className="flex items-center justify-center space-x-4">
                                <span className="text-sm font-medium text-gray-700">Monthly</span>
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                                <span className="text-sm font-medium text-gray-700">
                                    Yearly
                                    {billingCycle === 'yearly' && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            Save up to 20%
                                        </span>
                                    )}
                                </span>
                            </div>

                            {/* Plans Grid */}
                            <div className="grid md:grid-cols-3 gap-6">
                                {subscriptionPlans.map((plan) => {
                                    const isSelected = selectedPlan?.id === plan.id;
                                    const isPopular = plan.slug === 'professional';

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-indigo-300'
                                            } ${isPopular ? 'ring-2 ring-indigo-600 ring-opacity-50' : ''}`}
                                            onClick={() => setSelectedPlan(plan)}
                                        >
                                            {isPopular && (
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                    <span className="bg-indigo-600 text-white px-3 py-1 text-xs font-bold rounded-full flex items-center">
                                                        <Crown className="w-3 h-3 mr-1" />
                                                        Most Popular
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-center">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {plan.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-4">
                                                    {plan.description}
                                                </p>

                                                <div className="mb-6">
                                                    <span className="text-3xl font-bold text-gray-900">
                                                        {formatPrice(getPrice(plan))}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                                                    </span>
                                                    {billingCycle === 'yearly' && plan.yearly_savings > 0 && (
                                                        <div className="text-sm text-green-600 mt-1">
                                                            Save {formatPrice(plan.yearly_savings)} yearly
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3 text-left">
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                                        Up to {plan.max_products === 0 ? 'Unlimited' : plan.max_products} products
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                                        {plan.max_users} user{plan.max_users > 1 ? 's' : ''}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                                        {plan.advanced_reports ? 'Advanced' : 'Basic'} reports
                                                    </div>
                                                    {plan.priority_support && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                                            Priority support
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!selectedPlan}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <span>Continue</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Business Details */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Shop Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shop Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.shop_name}
                                            onChange={(e) => setData('shop_name', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                errors.shop_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Your Shop Name"
                                        />
                                    </div>
                                    {errors.shop_name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.shop_name}</p>
                                    )}
                                </div>

                                {/* Business Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            value={data.business_type}
                                            onChange={(e) => setData('business_type', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                errors.business_type ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            {businessTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.business_type && (
                                        <p className="mt-2 text-sm text-red-600">{errors.business_type}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                            errors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="01700000000"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                            errors.address ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Full business address"
                                    />
                                </div>
                                {errors.address && (
                                    <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center space-x-2"
                                >
                                    <span>Continue</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Account Setup */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Your Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Minimum 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Re-enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            {selectedPlan && (
                                <div className="bg-gray-50 rounded-lg p-6 border">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Plan:</span>
                                            <span className="font-medium">{selectedPlan.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Billing:</span>
                                            <span className="font-medium capitalize">{billingCycle}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Price:</span>
                                            <span className="font-medium">{formatPrice(getPrice(selectedPlan))}</span>
                                        </div>
                                        {billingCycle === 'yearly' && selectedPlan.yearly_savings > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Yearly Savings:</span>
                                                <span className="font-medium">-{formatPrice(selectedPlan.yearly_savings)}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span>Total:</span>
                                                <span>{formatPrice(getPrice(selectedPlan))}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            <span>Start Free Trial</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Error Message */}
                            {(errors as any).registration && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm">{(errors as any).registration}</p>
                                </div>
                            )}

                            {/* Terms */}
                            <p className="text-xs text-center text-gray-600">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-indigo-600 hover:text-indigo-700">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-indigo-600 hover:text-indigo-700">
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    )}
                </form>

                {/* Login Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
                </div>
            </div>
        </>
    );
};

export default TenantRegister;
