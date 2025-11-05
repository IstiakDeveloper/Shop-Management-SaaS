<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class TenantUserController extends Controller
{
    /**
     * Display a listing of tenant users.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'user',
                    'user_type' => $user->user_type ?? 'staff',
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at?->diffForHumans(),
                    'created_at' => $user->created_at->format('M d, Y'),
                ];
            });

        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();
        $tenantId = $currentUser->tenant_id;

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => ['required', 'confirmed', Password::defaults()],
                'role' => 'required|in:admin,manager,staff,user',
                'user_type' => 'required|in:admin,manager,staff,accountant,sales',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'tenant_id' => $tenantId,
                'role' => $validated['role'],
                'user_type' => $validated['user_type'],
                'is_active' => true,
                'is_super_admin' => false,
            ]);

            return response()->json([
                'message' => 'User created successfully!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'user_type' => $user->user_type,
                    'is_active' => $user->is_active,
                    'last_login_at' => null,
                    'created_at' => $user->created_at->format('M d, Y'),
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Ensure user belongs to the same tenant
        if ($user->tenant_id !== $currentUser->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent users from editing themselves through this endpoint
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => 'Use profile settings to edit your own account'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,manager,staff,user',
            'user_type' => 'required|in:admin,manager,staff,accountant,sales',
            'is_active' => 'boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'user_type' => $user->user_type,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at?->diffForHumans(),
                'created_at' => $user->created_at->format('M d, Y'),
            ]
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Ensure user belongs to the same tenant
        if ($user->tenant_id !== $currentUser->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password reset successfully!']);
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Ensure user belongs to the same tenant
        if ($user->tenant_id !== $currentUser->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent users from deactivating themselves
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => 'Cannot deactivate your own account'], 403);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return response()->json([
            'message' => 'User status updated successfully!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'user_type' => $user->user_type,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at?->diffForHumans(),
                'created_at' => $user->created_at->format('M d, Y'),
            ]
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Ensure user belongs to the same tenant
        if ($user->tenant_id !== $currentUser->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent users from deleting themselves
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully!']);
    }
}
