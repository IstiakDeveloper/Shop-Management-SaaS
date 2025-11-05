import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import SettingsNav from '../../components/settings-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
    Shield,
    ShieldCheck,
    ShieldX,
    Smartphone,
    Key,
    Download,
    RefreshCw,
    Copy,
    Check
} from 'lucide-react';

export default function TwoFactor() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Mock QR code and secret
    const qrCode = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjJGQSBRUiBDb2RlPC90ZXh0Pgo8L3N2Zz4K";
    const secretKey = "JBSWY3DPEHPK3PXP";

    const mockRecoveryCodes = [
        'a1b2c3d4',
        'e5f6g7h8',
        'i9j0k1l2',
        'm3n4o5p6',
        'q7r8s9t0',
        'u1v2w3x4',
        'y5z6a7b8',
        'c9d0e1f2'
    ];

    const handleEnable2FA = () => {
        setShowSetup(true);
        setRecoveryCodes(mockRecoveryCodes);
    };

    const handleConfirmSetup = () => {
        if (!confirmationCode.trim()) {
            alert('Please enter the confirmation code');
            return;
        }

        setProcessing(true);

        // Simulate API call
        setTimeout(() => {
            setIsEnabled(true);
            setShowSetup(false);
            setShowRecoveryCodes(true);
            setProcessing(false);
            setConfirmationCode('');
        }, 1000);
    };

    const handleDisable2FA = () => {
        if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
            setProcessing(true);

            setTimeout(() => {
                setIsEnabled(false);
                setShowRecoveryCodes(false);
                setRecoveryCodes([]);
                setProcessing(false);
            }, 1000);
        }
    };

    const handleRegenerateRecoveryCodes = () => {
        if (confirm('Are you sure you want to regenerate recovery codes? Your old codes will no longer work.')) {
            setProcessing(true);

            setTimeout(() => {
                setRecoveryCodes([...mockRecoveryCodes].sort(() => Math.random() - 0.5));
                setShowRecoveryCodes(true);
                setProcessing(false);
            }, 1000);
        }
    };

    const copyRecoveryCodes = () => {
        const codesText = recoveryCodes.join('\n');
        navigator.clipboard.writeText(codesText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const downloadRecoveryCodes = () => {
        const codesText = recoveryCodes.join('\n');
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recovery-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout>
            <Head title="Two-Factor Authentication - Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your account and preferences
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Settings Navigation */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardContent className="p-4">
                                    <SettingsNav currentPath="/settings/two-factor" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                        {/* Current Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isEnabled ? (
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ShieldX className="w-5 h-5 text-red-600" />
                                    )}
                                    Current Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            Two-Factor Authentication is{' '}
                                            <span className={isEnabled ? 'text-green-600' : 'text-red-600'}>
                                                {isEnabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {isEnabled
                                                ? 'Your account is protected with two-factor authentication'
                                                : 'Enable 2FA to add an extra layer of security to your account'
                                            }
                                        </p>
                                    </div>
                                    <Badge variant={isEnabled ? 'default' : 'destructive'}>
                                        {isEnabled ? 'Protected' : 'Vulnerable'}
                                    </Badge>
                                </div>

                                <div className="mt-4">
                                    {!isEnabled && !showSetup && (
                                        <Button onClick={handleEnable2FA}>
                                            <Shield className="w-4 h-4 mr-2" />
                                            Enable Two-Factor Authentication
                                        </Button>
                                    )}

                                    {isEnabled && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handleRegenerateRecoveryCodes}
                                                disabled={processing}
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                {processing ? 'Generating...' : 'Regenerate Recovery Codes'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDisable2FA}
                                                disabled={processing}
                                            >
                                                <ShieldX className="w-4 h-4 mr-2" />
                                                Disable 2FA
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Setup Process */}
                        {showSetup && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Smartphone className="w-5 h-5" />
                                        Setup Two-Factor Authentication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* QR Code */}
                                        <div className="space-y-4">
                                            <h3 className="font-medium">1. Scan QR Code</h3>
                                            <p className="text-sm text-gray-600">
                                                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                            </p>
                                            <div className="flex justify-center">
                                                <img
                                                    src={qrCode}
                                                    alt="2FA QR Code"
                                                    className="border rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        {/* Manual Entry */}
                                        <div className="space-y-4">
                                            <h3 className="font-medium">2. Or Enter Manually</h3>
                                            <p className="text-sm text-gray-600">
                                                If you can't scan the QR code, enter this secret key manually:
                                            </p>
                                            <div className="p-3 bg-gray-100 rounded font-mono text-sm break-all">
                                                {secretKey}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmation */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">3. Enter Confirmation Code</h3>
                                        <p className="text-sm text-gray-600">
                                            Enter the 6-digit code from your authenticator app to confirm setup:
                                        </p>
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1 max-w-xs">
                                                <Label htmlFor="confirmationCode">Confirmation Code</Label>
                                                <Input
                                                    id="confirmationCode"
                                                    type="text"
                                                    value={confirmationCode}
                                                    onChange={(e) => setConfirmationCode(e.target.value)}
                                                    placeholder="000000"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <Button
                                                onClick={handleConfirmSetup}
                                                disabled={processing || confirmationCode.length !== 6}
                                            >
                                                {processing ? 'Confirming...' : 'Confirm & Enable'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recovery Codes */}
                        {showRecoveryCodes && recoveryCodes.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5" />
                                        Recovery Codes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800 font-medium">Important!</p>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Store these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-sm">
                                        {recoveryCodes.map((code, index) => (
                                            <div key={index} className="p-2 bg-gray-100 rounded text-center">
                                                {code}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={copyRecoveryCodes}
                                            size="sm"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 mr-2" />
                                            ) : (
                                                <Copy className="w-4 h-4 mr-2" />
                                            )}
                                            {copied ? 'Copied!' : 'Copy Codes'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={downloadRecoveryCodes}
                                            size="sm"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Codes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>How Two-Factor Authentication Works</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-2">What you'll need:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                                            <li>• Your smartphone or tablet</li>
                                            <li>• Access to this account</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">How it protects you:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Requires both password and phone</li>
                                            <li>• Prevents unauthorized access</li>
                                            <li>• Works even if password is compromised</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
