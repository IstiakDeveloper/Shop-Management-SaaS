<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    // Get typed value
    public function getTypedValue()
    {
        return match($this->type) {
            'boolean' => (bool) $this->value,
            'number' => (float) $this->value,
            'json' => json_decode($this->value, true),
            default => $this->value,
        };
    }

    // Set typed value
    public function setTypedValue($value): void
    {
        $this->value = match($this->type) {
            'boolean' => $value ? '1' : '0',
            'number' => (string) $value,
            'json' => json_encode($value),
            default => (string) $value,
        };
        $this->save();
    }

    // Get setting by key
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->getTypedValue() : $default;
    }

    // Set setting by key
    public static function set(string $key, $value, string $type = 'string', string $group = 'general'): void
    {
        $setting = static::firstOrCreate(['key' => $key], [
            'type' => $type,
            'group' => $group,
        ]);

        $setting->setTypedValue($value);
    }

    // Get all settings by group
    public static function getByGroup(string $group): array
    {
        return static::where('group', $group)
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->getTypedValue()];
            })
            ->toArray();
    }

    // Get public settings (accessible to tenants)
    public static function getPublic(): array
    {
        return static::where('is_public', true)
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->getTypedValue()];
            })
            ->toArray();
    }

    // Scope for specific group
    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    // Scope for public settings
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    // Create default system settings
    public static function createDefaults(): void
    {
        $defaults = [
            // General settings
            ['key' => 'app_name', 'value' => 'Shop Management System', 'type' => 'string', 'group' => 'general'],
            ['key' => 'company_name', 'value' => 'Your Company', 'type' => 'string', 'group' => 'general'],
            ['key' => 'company_email', 'value' => 'admin@example.com', 'type' => 'string', 'group' => 'general'],
            ['key' => 'company_phone', 'value' => '+880 1234567890', 'type' => 'string', 'group' => 'general'],
            ['key' => 'default_currency', 'value' => 'BDT', 'type' => 'string', 'group' => 'general', 'is_public' => true],

            // Billing settings
            ['key' => 'tax_rate', 'value' => '0', 'type' => 'number', 'group' => 'billing'],
            ['key' => 'trial_period_days', 'value' => '7', 'type' => 'number', 'group' => 'billing'],
            ['key' => 'grace_period_days', 'value' => '3', 'type' => 'number', 'group' => 'billing'],

            // Email settings
            ['key' => 'send_welcome_email', 'value' => '1', 'type' => 'boolean', 'group' => 'email'],
            ['key' => 'send_invoice_email', 'value' => '1', 'type' => 'boolean', 'group' => 'email'],
            ['key' => 'send_expiry_reminder', 'value' => '1', 'type' => 'boolean', 'group' => 'email'],

            // Payment methods
            ['key' => 'bkash_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'payment'],
            ['key' => 'nagad_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'payment'],
            ['key' => 'bank_transfer_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'payment'],
        ];

        foreach ($defaults as $setting) {
            static::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
