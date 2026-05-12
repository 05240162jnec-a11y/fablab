<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductionTeam;
use App\Mail\ProductionTeamCredentials;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;


class ProductionTeamController extends Controller
{
    // Get all team members with filters
    public function index(Request $request)
    {
        $query = ProductionTeam::query();

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $members = $query->latest()->get();

        // Calculate stats
        $stats = [
            'total' => $members->count(),
            'available' => ProductionTeam::where('status', 'available')->count(),
            'assigned' => ProductionTeam::where('status', 'assigned')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $members,
            'stats' => $stats
        ]);
    }

    // Get single member
    public function show($id)
    {
        $member = ProductionTeam::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $member
        ]);
    }

    // Create new member
    // Create new member
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:production_teams,email',
        'phone' => 'nullable|string|max:20',
        'gender' => 'required|in:male,female,other',
        'status' => 'required|in:available,assigned',
        'assigned_task' => 'nullable|string|max:255',
    ]);

    // Generate random password
    $password = Str::random(10);
    
    $validated['password'] = Hash::make($password);

    $member = ProductionTeam::create($validated);

    // Send email with credentials
    try {
        Mail::to($member->email)->send(new ProductionTeamCredentials($member, $password));
    } catch (\Exception $e) {
        // Log error but don't fail the request
        \Log::error('Failed to send credentials email: ' . $e->getMessage());
    }

    return response()->json([
        'success' => true,
        'message' => 'Team member added successfully. Credentials sent to their email.',
        'data' => $member
    ], 201);
    }

    // Update member
    public function update(Request $request, $id)
    {
        $member = ProductionTeam::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('production_teams')->ignore($id)],
            'phone' => 'sometimes|nullable|string|max:20',
            'gender' => 'sometimes|in:male,female,other',
            'password' => 'sometimes|nullable|min:6|confirmed',
            'status' => 'sometimes|in:available,assigned',
            'assigned_task' => 'sometimes|nullable|string|max:255',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $member->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Team member updated successfully',
            'data' => $member
        ]);
    }

    // Delete member
    public function destroy($id)
    {
        $member = ProductionTeam::findOrFail($id);
        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Team member deleted successfully'
        ]);
    }
}