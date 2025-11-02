import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { TrendingUp, ArrowLeft } from 'lucide-react';

interface GuestLayoutProps {
    children: ReactNode;
}

const GuestLayout: React.FC<GuestLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Back to Home Link */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
            </Link>

            {/* Main Container */}
            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8 animate-fadeInDown">
                    <Link href="/" className="inline-flex flex-col items-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">ShopFlow</h1>
                        <p className="text-gray-600 text-sm">Complete Shop Management System</p>
                    </Link>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform duration-300 animate-fadeInUp">
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6 animate-fadeIn">
                    © 2025 ShopFlow. All rights reserved.
                </p>
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

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
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

                .animate-fadeInDown {
                    animation: fadeInDown 0.6s ease-out;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out 0.2s both;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out 0.4s both;
                }
            `}</style>
        </div>
    );
};

export default GuestLayout;
