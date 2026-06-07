<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccountDisabledMail;

class UserController extends Controller
{
    // ✅ Protected admin user ID
    protected $protectedAdminId = 1;

    // Get all users with filters
    public function index(Request $request)
    {
        $query = User::query();

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Filter by Active/Disabled status based on the tab
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->latest()->get();

        // Calculate stats
        $stats = [
            'total' => User::count(),
            'students' => User::where('role', 'student')->count(),
            'faculty' => User::where('role', 'faculty')->count(),
            'outsiders' => User::where('role', 'outsider')->count(),
            'production_team' => User::where('role', 'production_team')->count(),
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $users,
            'stats' => $stats
        ]);
    }

    // Get single user
    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    // Update user
    public function update(Request $request, $id)
    {
        // Prevent admin from being updated
        if ($id == $this->protectedAdminId) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot modify the main admin account.'
            ], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($id)],
            'gender' => 'sometimes|in:male,female,other',
            'role' => 'sometimes|in:student,faculty,outsider,production_team',
            'phone' => 'sometimes|string|max:20',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }
    
    // Toggle user status (enable/disable) with email notification
    public function toggleStatus($id)
    {
        // Prevent admin from being disabled
        if ($id == $this->protectedAdminId) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot disable the main admin account.'
            ], 403);
        }

        $user = User::findOrFail($id);
        
        // Toggle the is_active status
        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'enabled' : 'disabled';

        // Send email notification when user is disabled
        if (!$user->is_active) {
            try {
                Mail::to($user->email)->send(new AccountDisabledMail($user));
            } catch (\Exception $e) {
                \Log::error('Failed to send account disabled email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => "User {$status} successfully",
            'data' => $user
        ]);
    }

    // Delete user (permanent delete)
    public function destroy($id)
    {
        // Prevent admin from being deleted
        if ($id == $this->protectedAdminId) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the main admin account.'
            ], 403);
        }

        $user = User::findOrFail($id);
        
        // This will now be a hard delete since SoftDeletes is removed from the model
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}