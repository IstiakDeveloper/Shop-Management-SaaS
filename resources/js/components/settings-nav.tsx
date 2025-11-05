import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { User, Building2, Lock, Palette, Shield } from 'lucide-react';

interface SettingsNavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    description: string;
}

const settingsNavItems: SettingsNavItem[] = [
    {
        name: 'User Profile',
        href: '/settings/profile',
        icon: User,
        description: 'Manage your personal information',
    },
    {
        name: 'Business Profile',
        href: '/settings/tenant-profile',
        icon: Building2,
        description: 'Update business details and branding',
    },
    {
        name: 'Password',
        href: '/settings/password',
        icon: Lock,
        description: 'Change your password',
    },
    {
        name: 'Appearance',
        href: '/settings/appearance',
        icon: Palette,
        description: 'Customize the look and feel',
    },
    {
        name: 'Two-Factor Auth',
        href: '/settings/two-factor',
        icon: Shield,
        description: 'Secure your account',
    },
];

interface SettingsNavProps {
    currentPath?: string;
}

export default function SettingsNav({ currentPath }: SettingsNavProps) {
    return (
        <nav className="space-y-1">
            {settingsNavItems.map((item) => {
                const isActive = currentPath === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex items-start gap-3 px-4 py-3 rounded-lg transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-gray-700 hover:bg-gray-100'
                        )}
                    >
                        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', isActive ? 'text-primary-foreground' : 'text-gray-500')} />
                        <div className="flex-1 min-w-0">
                            <div className={cn('font-medium', isActive ? 'text-primary-foreground' : 'text-gray-900')}>
                                {item.name}
                            </div>
                            <div className={cn('text-sm', isActive ? 'text-primary-foreground/80' : 'text-gray-500')}>
                                {item.description}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
