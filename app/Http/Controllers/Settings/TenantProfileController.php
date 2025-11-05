<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TenantProfileController extends Controller
{
    /**
     * Show the tenant profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $tenant = Tenant::find($user->tenant_id);

        return Inertia::render('settings/tenant-profile', [
            'tenant' => $tenant,
            'user' => $user,
        ]);
    }

    /**
     * Update the tenant profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $tenant = Tenant::findOrFail($user->tenant_id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'business_type' => 'nullable|string|max:100',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($tenant->logo) {
                Storage::disk('public')->delete($tenant->logo);
            }

            // Store new logo
            $logoPath = $request->file('logo')->store('tenant-logos', 'public');
            $validated['logo'] = $logoPath;
        }

        // Update tenant
        $tenant->update($validated);

        return back()->with('success', 'Tenant profile updated successfully!');
    }

    /**
     * Delete tenant logo
     */
    public function deleteLogo(Request $request)
    {
        $user = Auth::user();
        $tenant = Tenant::findOrFail($user->tenant_id);

        if ($tenant->logo) {
            Storage::disk('public')->delete($tenant->logo);
            $tenant->update(['logo' => null]);
        }

        return back()->with('success', 'Logo deleted successfully!');
    }

    /**
     * Get tenant statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $stats = [
            'total_users' => \App\Models\User::where('tenant_id', $tenantId)->count(),
            'total_products' => \App\Models\Product::where('tenant_id', $tenantId)->count(),
            'total_customers' => \App\Models\Customer::where('tenant_id', $tenantId)->count(),
            'total_vendors' => \App\Models\Vendor::where('tenant_id', $tenantId)->count(),
            'total_sales' => \App\Models\Sale::where('tenant_id', $tenantId)->count(),
            'total_purchases' => \App\Models\Purchase::where('tenant_id', $tenantId)->count(),
        ];

        return response()->json($stats);
    }
}
