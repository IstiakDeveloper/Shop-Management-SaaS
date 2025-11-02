import React, { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import {
    TrendingUp,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    DollarSign,
    CheckCircle,
    ArrowRight,
    Menu,
    X,
    Star,
    Zap,
    Shield,
    Clock,
    Smartphone,
    Globe,
} from 'lucide-react';

interface WelcomeProps {
    auth?: {
        user?: {
            name: string;
        };
    };
}

const Welcome: React.FC<WelcomeProps> = ({ auth }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: Package,
            title: 'Product Management',
            description: 'Complete product catalog with images, categories, and detailed tracking',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: ShoppingCart,
            title: 'Smart Inventory',
            description: 'Real-time stock tracking with automatic average price calculation',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Users,
            title: 'Customer & Vendor',
            description: 'Manage relationships with complete due tracking and history',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: BarChart3,
            title: 'Advanced Reports',
            description: '5+ comprehensive reports with date-wise filtering and export',
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: DollarSign,
            title: 'Complete Accounting',
            description: 'Full accounting system with bank, fund, expense, and asset management',
            color: 'from-indigo-500 to-purple-500',
        },
        {
            icon: Zap,
            title: 'Fast & Efficient',
            description: 'Lightning-fast performance with modern tech stack',
            color: 'from-yellow-500 to-orange-500',
        },
    ];

    const benefits = [
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security with data encryption',
        },
        {
            icon: Clock,
            title: 'Real-time Updates',
            description: 'Instant synchronization across all devices',
        },
        {
            icon: Smartphone,
            title: 'Mobile Responsive',
            description: 'Works perfectly on all devices and screen sizes',
        },
        {
            icon: Globe,
            title: 'Multi-language',
            description: 'Support for Bengali and English languages',
        },
    ];

    const stats = [
        { value: '99.9%', label: 'Uptime' },
        { value: '500+', label: 'Active Users' },
        { value: '50K+', label: 'Transactions' },
        { value: '24/7', label: 'Support' },
    ];

    return (
        <>
            <Head title="Welcome to ShopFlow - Complete Shop Management System" />

            <div className="min-h-screen bg-white">
                {/* Navigation */}
                <nav
                    className={`fixed w-full z-50 transition-all duration-300 ${
                        scrolled
                            ? 'bg-white/95 backdrop-blur-md shadow-lg'
                            : 'bg-transparent'
                    }`}
                >
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">ShopFlow</h1>
                                    <p className="text-xs text-gray-600 hidden sm:block">
                                        Management System
                                    </p>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center space-x-8">
                                <a
                                    href="#features"
                                    className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    Features
                                </a>
                                <a
                                    href="#benefits"
                                    className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    Benefits
                                </a>
                                <a
                                    href="#pricing"
                                    className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    Pricing
                                </a>

                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/login"
                                            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/tenant-register"
                                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                        >
                                            Subscribe Now
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-gray-600" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-slideDown">
                            <div className="container mx-auto px-4 py-4 space-y-3">
                                <a
                                    href="#features"
                                    className="block px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </a>
                                <a
                                    href="#benefits"
                                    className="block px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Benefits
                                </a>
                                <a
                                    href="#pricing"
                                    className="block px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Pricing
                                </a>
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-center"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/tenant-register"
                                            className="block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-center"
                                        >
                                            Subscribe Now
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                        <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="container mx-auto text-center relative z-10">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full mb-6 animate-fadeInDown">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">
                                #1 Shop Management System in Bangladesh
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fadeInUp">
                            Manage Your Shop
                            <br />
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Like Never Before
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fadeInUp animation-delay-200">
                            Complete shop management solution with inventory, accounting, sales,
                            purchase, and advanced reporting. Everything you need in one place.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp animation-delay-400">
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                                >
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/tenant-register"
                                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                                    >
                                        <span>Start Free Trial</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href="/welcome"
                                        className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-indigo-300 transform hover:scale-105 transition-all duration-300"
                                    >
                                        Watch Demo
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fadeInUp animation-delay-600">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 px-4 bg-white">
                    <div className="container mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Powerful Features
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Everything you need to run your shop efficiently and profitably
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-indigo-200"
                                    >
                                        <div
                                            className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                                        >
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="benefits" className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="container mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Why Choose ShopFlow?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Built with modern technology for maximum performance and reliability
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                            <Icon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">{benefit.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 px-4 bg-white">
                    <div className="container mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Choose the plan that fits your business needs
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Starter Plan */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                                <p className="text-gray-600 mb-6">Perfect for small shops</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">৳2,999</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        Up to 500 products
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        Basic reports
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        2 users
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        Email support
                                    </li>
                                </ul>
                                <button className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                                    Get Started
                                </button>
                            </div>

                            {/* Professional Plan */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl transform scale-105 hover:-translate-y-2 transition-all duration-300 relative">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                                    Most Popular
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                                <p className="text-indigo-100 mb-6">Best for growing business</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">৳5,999</span>
                                    <span className="text-indigo-100">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-white">
                                        <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                                        Unlimited products
                                    </li>
                                    <li className="flex items-center text-white">
                                        <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                                        Advanced reports
                                    </li>
                                    <li className="flex items-center text-white">
                                        <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                                        10 users
                                    </li>
                                    <li className="flex items-center text-white">
                                        <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                                        Priority support
                                    </li>
                                    <li className="flex items-center text-white">
                                        <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                                        Custom branding
                                    </li>
                                </ul>
                                <button className="w-full px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                                    Get Started
                                </button>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                                <p className="text-gray-600 mb-6">For large businesses</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        Everything in Pro
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        Unlimited users
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        24/7 phone support
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        Dedicated manager
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        Custom features
                                    </li>
                                </ul>
                                <button className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="container mx-auto text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                            Join hundreds of businesses already using ShopFlow to manage their
                            operations efficiently
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/tenant-register"
                                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                            >
                                Start Free Trial
                            </Link>
                            <a
                                href="#features"
                                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all duration-300"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 px-4">
                    <div className="container mx-auto">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">ShopFlow</h3>
                                        <p className="text-xs text-gray-400">Management System</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Complete shop management solution for modern businesses.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Product</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            Pricing
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            Demo
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Company</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            Contact
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            Support
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Legal</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            Terms of Service
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm mb-4 md:mb-0">
                                © 2025 ShopFlow. All rights reserved.
                            </p>
                            <div className="flex space-x-6">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Facebook
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Twitter
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(20px, -50px) scale(1.1);
                    }
                    50% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    75% {
                        transform: translate(50px, 50px) scale(1.05);
                    }
                }

                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }

                .animation-delay-600 {
                    animation-delay: 0.6s;
                }

                .animate-fadeInDown {
                    animation: fadeInDown 0.6s ease-out;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default Welcome;
