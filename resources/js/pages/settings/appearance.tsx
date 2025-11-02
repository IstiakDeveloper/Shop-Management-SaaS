import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Monitor, Sun, Moon, Palette } from 'lucide-react';

export default function Appearance() {
    return (
        <AppLayout>
            <Head title="Appearance Settings" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Appearance Settings</h1>
                        <p className="text-gray-600 mt-1">
                            Customize the look and feel of your application
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Theme Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Theme Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="theme">Theme</Label>
                                    <Select defaultValue="system">
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">
                                                <div className="flex items-center gap-2">
                                                    <Sun className="w-4 h-4" />
                                                    Light
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="dark">
                                                <div className="flex items-center gap-2">
                                                    <Moon className="w-4 h-4" />
                                                    Dark
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="system">
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="w-4 h-4" />
                                                    System
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Choose your preferred theme or use system setting
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="color">Color Scheme</Label>
                                    <div className="grid grid-cols-6 gap-2 mt-2">
                                        {[
                                            { name: 'Blue', color: 'bg-blue-500' },
                                            { name: 'Green', color: 'bg-green-500' },
                                            { name: 'Purple', color: 'bg-purple-500' },
                                            { name: 'Red', color: 'bg-red-500' },
                                            { name: 'Orange', color: 'bg-orange-500' },
                                            { name: 'Pink', color: 'bg-pink-500' },
                                        ].map((color) => (
                                            <button
                                                key={color.name}
                                                className={`w-10 h-10 rounded-lg ${color.color} hover:scale-110 transition-transform ring-2 ring-offset-2 ring-transparent hover:ring-gray-300`}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Select your preferred accent color
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button>Save Changes</Button>
                                    <Button variant="outline">Reset to Default</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Display Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Display Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="font-size">Font Size</Label>
                                    <Select defaultValue="medium">
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select font size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">Small</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="large">Large</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="sidebar">Sidebar</Label>
                                    <Select defaultValue="expanded">
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select sidebar style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="expanded">Expanded</SelectItem>
                                            <SelectItem value="collapsed">Collapsed</SelectItem>
                                            <SelectItem value="auto">Auto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
