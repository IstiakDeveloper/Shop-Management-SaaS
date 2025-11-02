<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Models\Account;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'shop_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        DB::beginTransaction();

        try {
            // Create tenant (shop)
            $tenant = Tenant::create([
                'name' => $request->shop_name,
                'slug' => $this->generateSlug($request->shop_name),
                'email' => $request->email,
                'phone' => $request->phone,
                'subscription_plan' => 'basic',
                'subscription_expires_at' => now()->addDays(7), // 7-day trial
                'is_active' => true,
            ]);

            // Create user (shop owner/admin)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => $tenant->id,
                'role' => 'admin', // Shop owner is admin
                'user_type' => 'tenant_user',
                'is_super_admin' => false,
                'is_active' => true,
            ]);

            // Create basic subscription (trial)
            $basicPlan = SubscriptionPlan::where('slug', 'basic')->first();
            if ($basicPlan) {
                TenantSubscription::create([
                    'tenant_id' => $tenant->id,
                    'subscription_plan_id' => $basicPlan->id,
                    'billing_cycle' => 'monthly',
                    'amount' => 0, // Trial period
                    'starts_at' => now(),
                    'expires_at' => now()->addDays(7),
                    'next_billing_date' => now()->addDays(7),
                    'status' => 'active',
                    'auto_renew' => true,
                    'plan_features_snapshot' => $basicPlan->features,
                ]);
            }

            // Create default chart of accounts for the tenant
            Account::createDefaultChartOfAccounts($tenant->id);

            DB::commit();

            event(new Registered($user));

            Auth::login($user);

            return redirect()->route('dashboard');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Registration failed. Please try again.']);
        }
    }

    /**
     * Generate unique slug from shop name
     */
    private function generateSlug(string $name): string
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        $originalSlug = $slug;
        $count = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}
