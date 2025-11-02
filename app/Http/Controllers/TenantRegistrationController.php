<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Models\BillingInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class TenantRegistrationController extends Controller
{
    /**
     * Show the tenant registration form.
     */
    public function create(): Response
    {
        $subscriptionPlans = SubscriptionPlan::active()
            ->ordered()
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'description' => $plan->description,
                    'monthly_price' => $plan->monthly_price,
                    'yearly_price' => $plan->yearly_price,
                    'features' => $plan->features,
                    'max_users' => $plan->max_users,
                    'max_products' => $plan->max_products,
                    'max_customers' => $plan->max_customers,
                    'max_vendors' => $plan->max_vendors,
                    'multi_location' => $plan->multi_location,
                    'advanced_reports' => $plan->advanced_reports,
                    'api_access' => $plan->api_access,
                    'priority_support' => $plan->priority_support,
                    'yearly_savings' => $plan->getYearlySavings(),
                    'savings_percentage' => $plan->getSavingsPercentage(),
                ];
            });

        return Inertia::render('Auth/TenantRegister', [
            'subscriptionPlans' => $subscriptionPlans,
        ]);
    }

    /**
     * Handle tenant registration.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'shop_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'business_type' => 'required|string|in:retail,wholesale,restaurant,service,other',
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        try {
            DB::beginTransaction();

            // Create the tenant
            $tenant = Tenant::create([
                'name' => $request->shop_name,
                'slug' => Str::slug($request->shop_name) . '-' . Str::random(6),
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'business_type' => $request->business_type,
                'is_active' => true,
                'settings' => [
                    'currency' => 'BDT',
                    'timezone' => 'Asia/Dhaka',
                    'date_format' => 'd/m/Y',
                    'language' => 'en',
                ],
            ]);

            // Create the user and associate with tenant
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => $tenant->id,
                'role' => 'admin', // Tenant owner gets admin role
                'is_active' => true,
            ]);

            // Create subscription
            $plan = SubscriptionPlan::findOrFail($request->subscription_plan_id);
            $billingCycle = $request->billing_cycle;

            $amount = $billingCycle === 'yearly' ? $plan->yearly_price : $plan->monthly_price;
            $startsAt = now();
            $expiresAt = $billingCycle === 'yearly'
                ? $startsAt->copy()->addYear()
                : $startsAt->copy()->addMonth();

            $subscription = TenantSubscription::create([
                'tenant_id' => $tenant->id,
                'subscription_plan_id' => $plan->id,
                'billing_cycle' => $billingCycle,
                'amount' => $amount,
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'next_billing_date' => $expiresAt,
                'status' => 'trial', // Start with trial status
                'auto_renew' => true,
                'plan_features_snapshot' => $plan->features,
            ]);

            // Create first invoice (for trial, amount can be 0 or reduced)
            $invoiceAmount = $amount; // You can modify this for trial pricing

            $invoice = BillingInvoice::create([
                'tenant_id' => $tenant->id,
                'tenant_subscription_id' => $subscription->id,
                'invoice_number' => BillingInvoice::generateInvoiceNumber(),
                'invoice_date' => now()->toDateString(),
                'due_date' => $startsAt->copy()->addDays(7), // 7 days to pay
                'subtotal' => $invoiceAmount,
                'tax_amount' => 0,
                'total_amount' => $invoiceAmount,
                'status' => 'pending',
                'notes' => 'Initial subscription invoice for ' . $plan->name . ' plan',
            ]);

            DB::commit();

            // Log the user in
            Auth::login($user);

            return redirect('/dashboard')->with('success',
                'Account created successfully! Welcome to your ' . $plan->name . ' plan. Your trial period has started.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'registration' => 'Failed to create account. Please try again. Error: ' . $e->getMessage()
            ])->withInput();
        }
    }
}
