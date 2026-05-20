<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User; // ✅ Changed from ProductionTeam
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class ProductionTeamController extends Controller
{
    // ✅ Get all production team members (from users table)
    public function index(Request $request)
    {
        $query = User::where('role', 'production_team'); // ✅ Filter by role

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $members = $query->latest()->get();

        // Calculate stats
        $stats = [
            'total' => $members->count(),
            // Add more stats if you add a 'status' column later
        ];

        return response()->json([
            'success' => true,
            'data' => $members->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'gender' => $user->gender,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'email_verified_at' => $user->email_verified_at,
                ];
            }),
            'stats' => $stats
        ]);
    }

    // ✅ Get single member
    public function show($id)
    {
        $member = User::where('role', 'production_team')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $member
        ]);
    }

    // ✅ Create new production team member (in users table)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email', // ✅ Check users table
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female,other',
        ]);

        // Generate random password
        $password = Str::random(10);
        
        // ✅ Create user with production_team role
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password), // ✅ Hashed!
            'role' => 'production_team', // ✅ Critical!
            'gender' => $validated['gender'],
            'phone' => $validated['phone'] ?? null,
            'email_verified_at' => now(), // ✅ Auto-verify for immediate login
            'department' => null, // Optional: fill if needed
            'year_of_study' => null,
        ]);

        // 📧 Send email with credentials
        try {
            Mail::raw(
                "Hello {$user->name},\n\n" .
                "You have been added as a Production Team member for JNEC Fab Lab.\n\n" .
                "Your login credentials:\n" .
                "Email: {$user->email}\n" .
                "Password: {$password}\n\n" .
                "Please login at: " . url('/login') . "\n\n" .
                "Best regards,\nJNEC Fab Lab Admin",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('🔧 Welcome to JNEC Fab Lab - Production Team Access');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send credentials email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Production team member added successfully. Credentials sent to their email.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201);
    }

    // ✅ Update member
    public function update(Request $request, $id)
    {
        $member = User::where('role', 'production_team')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($id)],
            'phone' => 'sometimes|nullable|string|max:20',
            'gender' => 'sometimes|in:male,female,other',
            'password' => 'sometimes|nullable|min:6|confirmed',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $member->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Production team member updated successfully',
            'data' => $member
        ]);
    }

    // ✅ Delete member
    public function destroy($id)
    {
        $member = User::where('role', 'production_team')->findOrFail($id);
        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Production team member deleted successfully'
        ]);
    }
}