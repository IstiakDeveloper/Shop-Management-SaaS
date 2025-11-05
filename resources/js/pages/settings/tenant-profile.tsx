import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import SettingsNav from '../../components/settings-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Image as ImageIcon,
    Upload,
    X,
    Users,
    Package,
    ShoppingCart,
    TrendingUp,
    Check,
    UserPlus,
    Edit,
    Trash2,
    Key,
    Power,
    Eye,
    EyeOff,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';

interface TenantData {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    address: string | null;
    business_type: string | null;
    logo: string | null;
    is_active: boolean;
    subscription_plan: string | null;
    subscription_expires_at: string | null;
    created_at: string;
}

interface Props {
    tenant: TenantData;
    user: any;
}

interface Statistics {
    total_users: number;
    total_products: number;
    total_customers: number;
    total_vendors: number;
    total_sales: number;
    total_purchases: number;
}

interface TenantUser {
    id: number;
    name: string;
    email: string;
    role: string;
    user_type: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}

export default function TenantProfile({ tenant, user }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(
        tenant.logo ? `/storage/${tenant.logo}` : null
    );
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [users, setUsers] = useState<TenantUser[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<TenantUser | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordUser, setPasswordUser] = useState<TenantUser | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        business_type: tenant.business_type || '',
        logo: null as File | null,
        _method: 'PATCH',
    });

    const {
        data: userData,
        setData: setUserData,
        reset: resetUserData,
        processing: userProcessing,
        errors: userErrors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        user_type: 'staff',
        is_active: true,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        reset: resetPasswordData,
        processing: passwordProcessing,
        errors: passwordErrors,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Fetch statistics and users
    useEffect(() => {
        fetch('/settings/tenant-profile/statistics')
            .then((res) => res.json())
            .then((data) => setStatistics(data))
            .catch((err) => console.error('Failed to fetch statistics', err));

        fetchUsers();
    }, []);

    const fetchUsers = () => {
        fetch('/settings/tenant-profile/users')
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error('Failed to fetch users', err));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
    };

    const handleDeleteLogo = () => {
        if (confirm('Are you sure you want to delete the logo?')) {
            router.delete('/settings/tenant-profile/logo', {
                preserveScroll: true,
                onSuccess: () => {
                    setLogoPreview(null);
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/tenant-profile', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const openUserModal = (user?: TenantUser) => {
        if (user) {
            setEditingUser(user);
            setUserData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                role: user.role,
                user_type: user.user_type,
                is_active: user.is_active,
            });
        } else {
            setEditingUser(null);
            resetUserData();
        }
        setIsUserModalOpen(true);
    };

    const closeUserModal = () => {
        setIsUserModalOpen(false);
        setEditingUser(null);
        resetUserData();
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingUser
            ? `/settings/tenant-profile/users/${editingUser.id}`
            : '/settings/tenant-profile/users';

        const method = editingUser ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(editingUser ? {
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    user_type: userData.user_type,
                    is_active: userData.is_active,
                } : userData),
            });

            const result = await response.json();

            if (response.ok) {
                fetchUsers();
                closeUserModal();
                alert(result.message);
            } else {
                // Handle validation errors
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join('\n');
                    alert('Validation errors:\n' + errorMessages);
                } else {
                    alert(result.message || 'Failed to save user');
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('An error occurred while saving the user. Please check the console for details.');
        }
    };

    const openPasswordModal = (user: TenantUser) => {
        setPasswordUser(user);
        resetPasswordData();
        setIsPasswordModalOpen(true);
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPasswordUser(null);
        resetPasswordData();
        setShowPassword(false);
        setShowPasswordConfirm(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordUser) return;

        try {
            const response = await fetch(`/settings/tenant-profile/users/${passwordUser.id}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(passwordData),
            });

            const result = await response.json();

            if (response.ok) {
                closePasswordModal();
                alert(result.message);
            } else {
                alert(result.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('An error occurred while resetting password');
        }
    };

    const handleToggleStatus = async (user: TenantUser) => {
        if (
            !confirm(
                `Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.name}?`
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/settings/tenant-profile/users/${user.id}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            const result = await response.json();

            if (response.ok) {
                fetchUsers();
                alert(result.message);
            } else {
                alert(result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('An error occurred while updating user status');
        }
    };

    const handleDeleteUser = async (user: TenantUser) => {
        if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/settings/tenant-profile/users/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            const result = await response.json();

            if (response.ok) {
                fetchUsers();
                alert(result.message);
            } else {
                alert(result.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting user');
        }
    };

    const statCards = statistics
        ? [
              { icon: Users, label: 'Total Users', value: statistics.total_users, color: 'text-blue-600' },
              { icon: Package, label: 'Products', value: statistics.total_products, color: 'text-green-600' },
              { icon: Users, label: 'Customers', value: statistics.total_customers, color: 'text-purple-600' },
              { icon: Briefcase, label: 'Vendors', value: statistics.total_vendors, color: 'text-orange-600' },
              { icon: ShoppingCart, label: 'Sales', value: statistics.total_sales, color: 'text-pink-600' },
              { icon: TrendingUp, label: 'Purchases', value: statistics.total_purchases, color: 'text-indigo-600' },
          ]
        : [];

    return (
        <AppLayout>
            <Head title="Business Profile - Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your account and business preferences
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Settings Navigation */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardContent className="p-4">
                                    <SettingsNav currentPath="/settings/tenant-profile" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Success Message */}
                            {recentlySuccessful && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <p className="text-green-800 font-medium">Profile updated successfully!</p>
                                </div>
                            )}

                            {/* Statistics Cards */}
                        {statistics && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {statCards.map((stat, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex flex-col items-center text-center">
                                                <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {stat.value}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Business Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    Business Information
                                </CardTitle>
                                <CardDescription>
                                    Update your business details that will appear on reports and invoices
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Logo Upload Section */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <Label className="text-base font-semibold mb-3 block">
                                            Business Logo
                                        </Label>
                                        <div className="flex items-center gap-6">
                                            {/* Logo Preview */}
                                            <div className="flex-shrink-0">
                                                {logoPreview ? (
                                                    <div className="relative">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo Preview"
                                                            className="w-32 h-32 object-contain rounded-lg border-2 border-gray-200 bg-white p-2"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={data.logo ? handleRemoveLogo : handleDeleteLogo}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload Button */}
                                            <div className="flex-1">
                                                <label
                                                    htmlFor="logo-upload"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    <span>Upload Logo</span>
                                                    <input
                                                        id="logo-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    PNG, JPG, GIF up to 2MB. Recommended size: 300x300px
                                                </p>
                                                {errors.logo && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.logo}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Business Name */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Business Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter your business name"
                                                className="mt-1"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="business@example.com"
                                                className="mt-1"
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <Label htmlFor="phone" className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="+880 1234567890"
                                                className="mt-1"
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                            )}
                                        </div>

                                        {/* Business Type */}
                                        <div>
                                            <Label htmlFor="business_type" className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4" />
                                                Business Type
                                            </Label>
                                            <Input
                                                id="business_type"
                                                type="text"
                                                value={data.business_type}
                                                onChange={(e) => setData('business_type', e.target.value)}
                                                placeholder="e.g., Retail, Wholesale"
                                                className="mt-1"
                                            />
                                            {errors.business_type && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.business_type}
                                                </p>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="address" className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Business Address
                                            </Label>
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Enter your complete business address"
                                                rows={3}
                                                className="mt-1"
                                            />
                                            {errors.address && (
                                                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <p className="text-sm text-gray-500">
                                            * Required fields
                                        </p>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* User Management */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            User Management
                                        </CardTitle>
                                        <CardDescription>
                                            Manage users who have access to your business account
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => openUserModal()} className="gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Add User
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {users.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                            <p>No users found. Click "Add User" to create one.</p>
                                        </div>
                                    ) : (
                                        users.map((usr) => (
                                            <div
                                                key={usr.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {usr.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">
                                                                {usr.name}
                                                                {usr.id === user.id && (
                                                                    <Badge variant="outline" className="ml-2">
                                                                        You
                                                                    </Badge>
                                                                )}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">{usr.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 ml-13">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {usr.role}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {usr.user_type}
                                                        </Badge>
                                                        <Badge
                                                            variant={usr.is_active ? 'default' : 'destructive'}
                                                            className="text-xs"
                                                        >
                                                            {usr.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        {usr.last_login_at && (
                                                            <span className="text-xs text-gray-500">
                                                                Last login: {usr.last_login_at}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {usr.id !== user.id && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openUserModal(usr)}
                                                            className="gap-1"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openPasswordModal(usr)}
                                                            className="gap-1"
                                                        >
                                                            <Key className="w-3 h-3" />
                                                            Reset
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(usr)}
                                                            className="gap-1"
                                                        >
                                                            <Power className="w-3 h-3" />
                                                            {usr.is_active ? 'Deactivate' : 'Activate'}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(usr)}
                                                            className="gap-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>View your account details and status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Account Status</span>
                                        <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
                                            {tenant.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Subscription Plan</span>
                                        <Badge variant="secondary">
                                            {tenant.subscription_plan || 'Free'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Business ID</span>
                                        <span className="text-sm text-gray-900 font-mono">
                                            #{tenant.slug}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Member Since</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(tenant.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Create/Edit Modal */}
            <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? 'Update user information and permissions'
                                : 'Add a new user to your business account'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="user_name">Full Name *</Label>
                            <Input
                                id="user_name"
                                value={userData.name}
                                onChange={(e) => setUserData('name', e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                            {userErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{userErrors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="user_email">Email Address *</Label>
                            <Input
                                id="user_email"
                                type="email"
                                value={userData.email}
                                onChange={(e) => setUserData('email', e.target.value)}
                                placeholder="john@example.com"
                                required
                            />
                            {userErrors.email && (
                                <p className="text-red-500 text-sm mt-1">{userErrors.email}</p>
                            )}
                        </div>

                        {!editingUser && (
                            <>
                                <div>
                                    <Label htmlFor="user_password">Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="user_password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={userData.password}
                                            onChange={(e) => setUserData('password', e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {userErrors.password && (
                                        <p className="text-red-500 text-sm mt-1">{userErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="user_password_confirmation">Confirm Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="user_password_confirmation"
                                            type={showPasswordConfirm ? 'text' : 'password'}
                                            value={userData.password_confirmation}
                                            onChange={(e) =>
                                                setUserData('password_confirmation', e.target.value)
                                            }
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPasswordConfirm ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="user_role">Role *</Label>
                                <Select
                                    value={userData.role}
                                    onValueChange={(value) => setUserData('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="user_type">User Type *</Label>
                                <Select
                                    value={userData.user_type}
                                    onValueChange={(value) => setUserData('user_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="accountant">Accountant</SelectItem>
                                        <SelectItem value="sales">Sales</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {editingUser && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="user_active"
                                    checked={userData.is_active}
                                    onChange={(e) => setUserData('is_active', e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="user_active" className="cursor-pointer">
                                    Active User
                                </Label>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeUserModal}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={userProcessing}>
                                {userProcessing
                                    ? 'Saving...'
                                    : editingUser
                                    ? 'Update User'
                                    : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Password Reset Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Reset password for {passwordUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div>
                            <Label htmlFor="reset_password">New Password *</Label>
                            <div className="relative">
                                <Input
                                    id="reset_password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {passwordErrors.password && (
                                <p className="text-red-500 text-sm mt-1">{passwordErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="reset_password_confirmation">Confirm Password *</Label>
                            <div className="relative">
                                <Input
                                    id="reset_password_confirmation"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    value={passwordData.password_confirmation}
                                    onChange={(e) =>
                                        setPasswordData('password_confirmation', e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswordConfirm ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closePasswordModal}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={passwordProcessing}>
                                {passwordProcessing ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
