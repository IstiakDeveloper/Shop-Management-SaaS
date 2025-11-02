<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Perfect for small shops and startups',
                'monthly_price' => 2999.00,
                'yearly_price' => 29990.00, // ~17% discount
                'features' => [
                    'Up to 500 products',
                    '2 users',
                    'Basic reports',
                ],
                'max_users' => 2,
                'max_products' => 500,
                'max_customers' => 1000,
                'max_vendors' => 50,
                'multi_location' => false,
                'advanced_reports' => false,
                'api_access' => false,
                'priority_support' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Ideal for growing businesses',
                'monthly_price' => 1200.00,
                'yearly_price' => 12000.00, // ~17% discount
                'features' => [
                    'Up to 2000 products',
                    '15 users',
                    'Advanced reports',
                    'Priority support',
                ],
                'max_users' => 15,
                'max_products' => 2000,
                'max_customers' => 0, // Unlimited
                'max_vendors' => 0, // Unlimited
                'multi_location' => true,
                'advanced_reports' => true,
                'api_access' => false,
                'priority_support' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Best for growing businesses',
                'monthly_price' => 5999.00,
                'yearly_price' => 59990.00, // ~17% discount
                'features' => [
                    'Unlimited products',
                    '10 users',
                    'Advanced reports',
                    'Priority support',
                ],
                'max_users' => 10,
                'max_products' => 0, // Unlimited
                'max_customers' => 0, // Unlimited
                'max_vendors' => 0, // Unlimited
                'multi_location' => true,
                'advanced_reports' => true,
                'api_access' => false,
                'priority_support' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }

        $this->command->info('Subscription plans updated successfully!');
    }
}
