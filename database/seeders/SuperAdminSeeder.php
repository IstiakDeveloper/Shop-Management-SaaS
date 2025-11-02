<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin User (without tenant)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@shopmanagement.com'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('SuperAdmin@123'),
                'tenant_id' => null, // Super admin doesn't belong to any tenant
                'role' => 'super_admin',
                'user_type' => 'super_admin',
                'is_super_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create default system settings
        SystemSetting::createDefaults();

        $this->command->info('Super Admin created successfully!');
        $this->command->info('Email: superadmin@shopmanagement.com');
        $this->command->info('Password: SuperAdmin@123');
        $this->command->warn('Please change the password after first login!');
    }
}
