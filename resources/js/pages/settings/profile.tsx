import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Trash2 } from 'lucide-react';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    address: string;
    company: string;
}

export default function Profile() {
    const [data, setData] = useState<ProfileData>({
        name: 'Admin User',
        email: 'admin@shopmanagement.com',
        phone: '+880 1234567890',
        address: 'Dhaka, Bangladesh',
        company: 'Shop Management System',
    });
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Basic validation
        const newErrors: any = {};
        if (!data.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!data.email.trim()) {
            newErrors.email = 'Email is required';
        }
        if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = 'Please enter a valid email';
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
            setTimeout(() => setRecentlySuccessful(false), 3000);
        }, 1000);
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Simulate deletion
            alert('Account deletion functionality would be implemented here');
        }
    };

    return (
        <AppLayout>
            <Head title="Profile Settings" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600 mt-1">
                            Update your account information and manage your profile
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Profile Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name */}
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                                placeholder="Enter your email"
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                                                placeholder="Enter your phone number"
                                            />
                                        </div>

                                        {/* Company */}
                                        <div>
                                            <Label htmlFor="company">Company</Label>
                                            <Input
                                                id="company"
                                                type="text"
                                                value={data.company}
                                                onChange={(e) => setData({ ...data, company: e.target.value })}
                                                placeholder="Enter your company name"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData({ ...data, address: e.target.value })}
                                            placeholder="Enter your address"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>

                                        {recentlySuccessful && (
                                            <p className="text-green-600 text-sm">
                                                Profile updated successfully!
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>Email Verification</span>
                                    </div>
                                    <Badge variant="default">Verified</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Account Created</span>
                                    </div>
                                    <span className="text-sm text-gray-500">January 15, 2024</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span>Account Type</span>
                                    </div>
                                    <Badge variant="secondary">Admin</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-red-800">Delete Account</h3>
                                        <p className="text-sm text-red-600">
                                            Permanently delete your account and all data. This action cannot be undone.
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        className="ml-4"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
