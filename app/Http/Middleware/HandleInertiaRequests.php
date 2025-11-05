<?php

namespace App\Http\Middleware;

use App\Models\Account;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Get bank balance and tenant info if user is authenticated
        $bankBalance = null;
        $tenant = null;
        if ($request->user() && $request->user()->tenant_id) {
            $bankAccount = Account::getBankAccount($request->user()->tenant_id);
            $bankBalance = $bankAccount ? $bankAccount->current_balance : 0;

            // Get tenant information
            $tenant = \App\Models\Tenant::find($request->user()->tenant_id);
        }

        // Get user permissions
        $permissions = [];
        if ($request->user()) {
            $userRole = $request->user()->role ?? 'user';
            $isSuperAdmin = $request->user()->is_super_admin ?? false;

            // Define permissions based on role
            $permissions = [
                'canViewDashboard' => true,
                'canManageInventory' => in_array($userRole, ['admin', 'manager']) || $isSuperAdmin,
                'canManagePurchases' => in_array($userRole, ['admin', 'manager']) || $isSuperAdmin,
                'canManageSales' => in_array($userRole, ['admin', 'manager', 'staff']) || $isSuperAdmin,
                'canManageAccounting' => in_array($userRole, ['admin', 'manager']) || $isSuperAdmin,
                'canManageFixedAssets' => in_array($userRole, ['admin', 'manager']) || $isSuperAdmin,
                'canViewReports' => in_array($userRole, ['admin', 'manager']) || $isSuperAdmin,
                'canManageSettings' => in_array($userRole, ['admin']) || $isSuperAdmin,
                'canAccessPOS' => true, // All users can access POS
                'isSuperAdmin' => $isSuperAdmin,
                'role' => $userRole,
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'permissions' => $permissions,
            ],
            'tenant' => $tenant,
            'bank_balance' => $bankBalance,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
                'warning' => $request->session()->get('warning'),
            ],
        ];
    }
}
