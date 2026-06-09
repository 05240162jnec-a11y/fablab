<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show()
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at->format('M d, Y'),
            ]
        ]);
    }

        /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'role' => ['nullable', Rule::in(['student', 'faculty', 'outsider', 'production_team', 'admin'])],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other', 'prefer-not-to-say'])],
            'profile_photo' => 'nullable|image|mimes:png|max:2048', // PNG only, max 2MB
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'department' => $request->department,
            'role' => $request->role,
            'gender' => $request->gender, // ✅ Add gender
        ];

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $photo = $request->file('profile_photo');
            $photoName = 'profile_' . $user->id . '_' . time() . '.png';
            $photoPath = $photo->storeAs('profile-photos', $photoName, 'public');
            $updateData['profile_photo'] = $photoPath;
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->fresh()->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at->format('M d, Y'),
            ]
        ]);
    }

    /**
     * Change the user's password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Check if current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.'
        ]);
    }
}