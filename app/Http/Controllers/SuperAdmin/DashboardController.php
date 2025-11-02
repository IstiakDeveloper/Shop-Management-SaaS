<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Models\BillingInvoice;
use App\Models\BillingPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    public function index()
    {
        // Get overview statistics
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'total_plans' => SubscriptionPlan::count(),
            'total_subscriptions' => TenantSubscription::count(),
            'active_subscriptions' => TenantSubscription::where('status', 'active')->count(),
            'expired_subscriptions' => TenantSubscription::where('status', 'expired')->count(),
            'total_revenue' => (float) (BillingPayment::where('status', 'completed')->sum('amount') ?: 0),
            'monthly_revenue' => (float) (BillingPayment::whereMonth('payment_date', now()->month)
                ->where('status', 'completed')
                ->sum('amount') ?: 0),
            'pending_invoices' => BillingInvoice::where('status', 'pending')->count(),
            'overdue_invoices' => BillingInvoice::where('status', 'pending')
                ->where('due_date', '<', now())
                ->count(),
        ];

        // Recent activities
        $recentTenants = Tenant::latest()->limit(5)->get();
        $recentPayments = BillingPayment::with(['tenant', 'billingInvoice'])
            ->latest('payment_date')
            ->limit(10)
            ->get();

        // Expiring subscriptions (next 30 days)
        $expiringSubscriptions = TenantSubscription::with(['tenant', 'subscriptionPlan'])
            ->where('status', 'active')
            ->where('expires_at', '<=', now()->addDays(30))
            ->where('expires_at', '>', now())
            ->orderBy('expires_at')
            ->limit(10)
            ->get();

        // Revenue chart data (last 12 months)
        $revenueData = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $revenue = BillingPayment::whereYear('payment_date', $month->year)
                ->whereMonth('payment_date', $month->month)
                ->where('status', 'completed')
                ->sum('amount');

            $revenueData[] = [
                'month' => $month->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        }

        // Subscription plan distribution
        $planDistribution = SubscriptionPlan::withCount(['activeTenants'])
            ->get()
            ->map(function ($plan) {
                return [
                    'name' => $plan->name,
                    'count' => $plan->active_tenants_count,
                    'revenue' => TenantSubscription::where('subscription_plan_id', $plan->id)
                        ->where('status', 'active')
                        ->sum('amount'),
                ];
            });

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'recentPayments' => $recentPayments,
            'expiringSubscriptions' => $expiringSubscriptions,
            'revenueData' => $revenueData,
            'planDistribution' => $planDistribution,
        ]);
    }

    public function tenants(Request $request)
    {
        $query = Tenant::with(['users' => function($q) {
            $q->where('role', 'admin');
        }])
        ->withCount(['users', 'products', 'sales']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by subscription plan
        if ($request->filled('plan')) {
            $query->whereHas('subscriptions', function($q) use ($request) {
                $q->where('subscription_plan_id', $request->plan)
                  ->where('status', 'active');
            });
        }

        $tenants = $query->paginate(20);
        $subscriptionPlans = SubscriptionPlan::active()->get();

        return Inertia::render('SuperAdmin/Tenants/Index', [
            'tenants' => $tenants,
            'subscriptionPlans' => $subscriptionPlans,
            'filters' => $request->only(['search', 'status', 'plan']),
            'stats' => [
                'total_tenants' => Tenant::count() ?: 0,
                'active_tenants' => Tenant::where('is_active', true)->count() ?: 0,
                'inactive_tenants' => Tenant::where('is_active', false)->count() ?: 0,
                'with_subscriptions' => Tenant::whereHas('subscriptions', function($q) {
                    $q->where('status', 'active');
                })->count() ?: 0,
            ],
        ]);
    }

    public function createTenant()
    {
        $subscriptionPlans = SubscriptionPlan::active()->get();

        return Inertia::render('SuperAdmin/Tenants/Create', [
            'subscriptionPlans' => $subscriptionPlans,
        ]);
    }

    public function storeTenant(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:tenants,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'domain' => 'nullable|string|max:255|unique:tenants,domain',
            'create_subscription' => 'boolean',
            'subscription_plan_id' => 'nullable|exists:subscription_plans,id',
            'billing_cycle' => 'nullable|in:monthly,yearly',
        ]);

        // Generate slug from name
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Create tenant
        $tenant = Tenant::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'domain' => $validated['domain'] ?? null,
            'is_active' => true,
            'settings' => [
                'timezone' => 'Asia/Dhaka',
                'currency' => 'BDT',
                'language' => 'en',
            ],
        ]);

        // Create admin user for the tenant
        $adminUser = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Admin',
            'email' => $validated['email'],
            'password' => Hash::make('password123'), // Default password
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create subscription if requested
        if ($validated['create_subscription'] && $validated['subscription_plan_id']) {
            $this->createTenantSubscription($tenant, $validated);
        }

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Tenant created successfully! Default login: ' . $validated['email'] . ' / password123');
    }

    public function createSubscription(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'starts_at' => 'nullable|date',
        ]);

        $this->createTenantSubscription($tenant, $validated);

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Subscription created successfully for ' . $tenant->name);
    }

    private function createTenantSubscription(Tenant $tenant, array $data)
    {
        $plan = SubscriptionPlan::findOrFail($data['subscription_plan_id']);
        $billingCycle = $data['billing_cycle'];
        $startsAt = isset($data['starts_at']) ? Carbon::parse($data['starts_at']) : now();

        // Calculate amount and expiry
        $amount = $billingCycle === 'yearly' ? $plan->yearly_price : $plan->monthly_price;
        $expiresAt = $billingCycle === 'yearly'
            ? $startsAt->copy()->addYear()
            : $startsAt->copy()->addMonth();

        // Create subscription
        $subscription = TenantSubscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $plan->id,
            'billing_cycle' => $billingCycle,
            'amount' => $amount,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'next_billing_date' => $expiresAt,
            'status' => 'active',
            'auto_renew' => true,
            'plan_features_snapshot' => $plan->features,
        ]);

        // Create first invoice
        $invoice = BillingInvoice::create([
            'tenant_id' => $tenant->id,
            'tenant_subscription_id' => $subscription->id,
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'invoice_date' => now()->toDateString(),
            'billing_period_start' => $startsAt,
            'billing_period_end' => $expiresAt,
            'subtotal' => $amount,
            'tax_amount' => 0,
            'total_amount' => $amount,
            'due_date' => $startsAt->copy()->addDays(7),
            'status' => 'pending',
            'notes' => 'Initial subscription invoice',
        ]);

        return $subscription;
    }

    public function subscriptions(Request $request)
    {
        $query = TenantSubscription::with(['tenant', 'subscriptionPlan']);

        // Search by tenant name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('tenant', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by plan
        if ($request->filled('plan')) {
            $query->where('subscription_plan_id', $request->plan);
        }

        $subscriptions = $query->latest()->paginate(20);
        $subscriptionPlans = SubscriptionPlan::all();

        // Calculate stats with null safety
        $stats = [
            'total_subscriptions' => TenantSubscription::count() ?: 0,
            'active_subscriptions' => TenantSubscription::where('status', 'active')->count() ?: 0,
            'trial_subscriptions' => TenantSubscription::where('status', 'trial')->count() ?: 0,
            'expired_subscriptions' => TenantSubscription::where('status', 'expired')->count() ?: 0,
            'monthly_revenue' => (float) (BillingPayment::whereMonth('payment_date', now()->month)
                ->where('status', 'completed')
                ->sum('amount') ?: 0),
            'churn_rate' => 5.2, // Sample data
        ];

        return Inertia::render('SuperAdmin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'subscriptionPlans' => $subscriptionPlans,
            'filters' => $request->only(['search', 'status', 'plan']),
            'stats' => $stats,
        ]);
    }

    public function invoices(Request $request)
    {
        $query = BillingInvoice::with(['tenant', 'tenantSubscription.subscriptionPlan']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('tenant', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->latest('invoice_date')->paginate(20);

        // Calculate stats with null safety
        $stats = [
            'total_invoices' => BillingInvoice::count() ?: 0,
            'pending_invoices' => BillingInvoice::where('status', 'pending')->count() ?: 0,
            'paid_invoices' => BillingInvoice::where('status', 'paid')->count() ?: 0,
            'overdue_invoices' => BillingInvoice::where('status', 'pending')
                ->where('due_date', '<', now())->count() ?: 0,
            'total_amount' => (float) (BillingInvoice::sum('total_amount') ?: 0),
            'pending_amount' => (float) (BillingInvoice::where('status', 'pending')->sum('total_amount') ?: 0),
            'overdue_amount' => (float) (BillingInvoice::where('status', 'pending')
                ->where('due_date', '<', now())->sum('total_amount') ?: 0),
        ];

        return Inertia::render('SuperAdmin/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
        ]);
    }

    public function payments(Request $request)
    {
        $query = BillingPayment::with(['tenant', 'billingInvoice']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhereHas('tenant', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->filled('method')) {
            $query->where('payment_method', $request->input('method'));
        }

        $payments = $query->latest('payment_date')->paginate(20);

        // Calculate stats with null safety
        $stats = [
            'total_payments' => BillingPayment::count() ?: 0,
            'completed_payments' => BillingPayment::where('status', 'completed')->count() ?: 0,
            'pending_payments' => BillingPayment::where('status', 'pending')->count() ?: 0,
            'failed_payments' => BillingPayment::where('status', 'failed')->count() ?: 0,
            'total_amount' => (float) (BillingPayment::sum('amount') ?: 0),
            'completed_amount' => (float) (BillingPayment::where('status', 'completed')->sum('amount') ?: 0),
            'pending_amount' => (float) (BillingPayment::where('status', 'pending')->sum('amount') ?: 0),
            'refunded_amount' => (float) (BillingPayment::where('status', 'refunded')->sum('amount') ?: 0),
        ];

        return Inertia::render('SuperAdmin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'method']),
            'stats' => $stats,
        ]);
    }

    public function reports()
    {
        // Revenue report
        $monthlyRevenue = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $revenue = BillingPayment::whereYear('payment_date', $month->year)
                ->whereMonth('payment_date', $month->month)
                ->where('status', 'completed')
                ->sum('amount');

            $monthlyRevenue[] = [
                'month' => $month->format('M Y'),
                'revenue' => (float) $revenue,
                'growth_percentage' => rand(-10, 25), // Sample data
                'new_subscriptions' => rand(5, 15),
                'renewals' => rand(20, 50),
            ];
        }

        // Subscription growth
        $subscriptionGrowth = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $newSubs = rand(0, 5);
            $cancelled = rand(0, 2);

            $subscriptionGrowth[] = [
                'date' => $date->format('Y-m-d'),
                'new_subscriptions' => $newSubs,
                'cancelled_subscriptions' => $cancelled,
                'net_growth' => $newSubs - $cancelled,
            ];
        }

        // Plan popularity
        $planPopularity = SubscriptionPlan::all()->map(function ($plan) {
            $activeSubscriptions = TenantSubscription::where('subscription_plan_id', $plan->id)
                ->where('status', 'active')
                ->count();

            return [
                'name' => $plan->name,
                'count' => $activeSubscriptions,
                'percentage' => 0, // Will be calculated below
                'revenue' => $activeSubscriptions * $plan->monthly_price,
            ];
        });

        $totalActive = $planPopularity->sum('count');
        $planPopularity = $planPopularity->map(function ($item) use ($totalActive) {
            $item['percentage'] = $totalActive > 0 ? round(($item['count'] / $totalActive) * 100, 1) : 0;
            return $item;
        });

        // Top tenants
        $topTenants = Tenant::with('subscriptions')
            ->limit(10)
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'total_paid' => rand(10000, 100000),
                    'plan' => 'Premium',
                    'joined_date' => $tenant->created_at->format('Y-m-d'),
                ];
            });

        // Summary stats with null safety
        $thisMonthRevenue = (float) (BillingPayment::whereMonth('payment_date', now()->month)
            ->where('status', 'completed')->sum('amount') ?: 0);
        $lastMonthRevenue = (float) (BillingPayment::whereMonth('payment_date', now()->subMonth()->month)
            ->where('status', 'completed')->sum('amount') ?: 0);

        $summary = [
            'total_revenue_this_month' => $thisMonthRevenue,
            'total_revenue_last_month' => $lastMonthRevenue,
            'revenue_growth_percentage' => $lastMonthRevenue > 0
                ? (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100
                : 0,
            'total_tenants' => Tenant::count() ?: 0,
            'active_subscriptions' => TenantSubscription::where('status', 'active')->count() ?: 0,
            'churn_rate' => 3.2,
            'average_revenue_per_tenant' => 5000,
            'lifetime_value' => 25000,
        ];

        return Inertia::render('SuperAdmin/Reports/Index', [
            'monthlyRevenue' => $monthlyRevenue,
            'subscriptionGrowth' => $subscriptionGrowth,
            'planPopularity' => $planPopularity,
            'topTenants' => $topTenants,
            'summary' => $summary,
            'filters' => request()->only(['period', 'plan']),
        ]);
    }
}
