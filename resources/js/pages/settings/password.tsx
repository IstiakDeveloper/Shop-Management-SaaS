import React, { useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

interface PasswordData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export default function Password() {
    const [data, setData] = useState<PasswordData>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Basic validation
        const newErrors: any = {};
        if (!data.current_password) {
            newErrors.current_password = 'Current password is required';
        }
        if (!data.password) {
            newErrors.password = 'New password is required';
        }
        if (data.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (data.password !== data.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setProcessing(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            setProcessing(false);
            setRecentlySuccessful(true);
            setData({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
            setTimeout(() => setRecentlySuccessful(false), 3000);
        }, 1000);
    };

    return (
        <AppLayout>
            <Head title="Password Settings" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Password Settings</h1>
                        <p className="text-gray-600 mt-1">
                            Ensure your account is using a long, random password to stay secure
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                Update Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={data.current_password}
                                            onChange={(e) => setData({ ...data, current_password: e.target.value })}
                                            placeholder="Enter current password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.current_password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData({ ...data, password: e.target.value })}
                                            placeholder="Enter new password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Password must be at least 8 characters long
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                            placeholder="Confirm new password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                {/* Password Strength Indicator */}
                                {data.password && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-sm mb-2">Password Strength</h4>
                                        <div className="space-y-1">
                                            <div className={`text-xs ${data.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                                ✓ At least 8 characters
                                            </div>
                                            <div className={`text-xs ${/[A-Z]/.test(data.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                ✓ Contains uppercase letter
                                            </div>
                                            <div className={`text-xs ${/[a-z]/.test(data.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                ✓ Contains lowercase letter
                                            </div>
                                            <div className={`text-xs ${/\d/.test(data.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                ✓ Contains number
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        <Shield className="w-4 h-4 mr-2" />
                                        {processing ? 'Updating...' : 'Update Password'}
                                    </Button>

                                    {recentlySuccessful && (
                                        <p className="text-green-600 text-sm">
                                            Password updated successfully!
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
