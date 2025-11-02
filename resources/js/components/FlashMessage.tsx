import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

const FlashMessage: React.FC = () => {
    const { flash } = usePage<{ flash: FlashMessages }>().props;
    const [visible, setVisible] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const newVisible: { [key: string]: boolean } = {};
        if (flash.success) newVisible.success = true;
        if (flash.error) newVisible.error = true;
        if (flash.warning) newVisible.warning = true;
        if (flash.info) newVisible.info = true;
        setVisible(newVisible);

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
            setVisible({});
        }, 5000);

        return () => clearTimeout(timer);
    }, [flash]);

    const getMessage = (type: keyof FlashMessages) => {
        const configs = {
            success: {
                icon: CheckCircle,
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                iconColor: 'text-green-600',
            },
            error: {
                icon: XCircle,
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                iconColor: 'text-red-600',
            },
            warning: {
                icon: AlertCircle,
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-800',
                iconColor: 'text-yellow-600',
            },
            info: {
                icon: Info,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800',
                iconColor: 'text-blue-600',
            },
        };

        const config = configs[type];
        const Icon = config.icon;
        const message = flash[type];

        if (!message || !visible[type]) return null;

        return (
            <div
                className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg flex items-start space-x-3 animate-slide-in`}
            >
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <p className={`flex-1 text-sm ${config.textColor} font-medium`}>{message}</p>
                <button
                    onClick={() => setVisible({ ...visible, [type]: false })}
                    className={`${config.iconColor} hover:opacity-70 transition`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    };

    const hasMessages = flash.success || flash.error || flash.warning || flash.info;

    if (!hasMessages) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
            {getMessage('success')}
            {getMessage('error')}
            {getMessage('warning')}
            {getMessage('info')}
        </div>
    );
};

export default FlashMessage;
