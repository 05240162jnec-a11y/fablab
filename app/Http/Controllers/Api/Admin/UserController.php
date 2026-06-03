<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
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

        $users = $query->latest()->get();

        // Calculate stats
        $stats = [
            'total' => $users->count(),
            'students' => User::where('role', 'student')->count(),
            'faculty' => User::where('role', 'faculty')->count(),
            'outsiders' => User::where('role', 'outsider')->count(),
            'production_team' => User::where('role', 'production_team')->count(), // ✅ Added
            'active' => User::where('is_active', true)->count(), // ✅ Added
            'inactive' => User::where('is_active', false)->count(), // ✅ Added
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
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($id)],
            'gender' => 'sometimes|in:male,female,other',
            'role' => 'sometimes|in:student,faculty,outsider,production_team', // ✅ Added production_team
            'phone' => 'sometimes|string|max:20',
            'is_active' => 'sometimes|boolean', // ✅ Added
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    // ✅ Toggle user status (enable/disable)
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        
        // Toggle the is_active status
        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'enabled' : 'disabled';

        return response()->json([
            'success' => true,
            'message' => "User {$status} successfully",
            'data' => $user
        ]);
    }

    // Delete user (permanent delete - kept for backup)
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}