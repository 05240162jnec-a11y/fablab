<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Get current admin's profile
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
                'phone' => $user->phone,
                'gender' => $user->gender,
                'role' => $user->role,
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at?->format('M d, Y'),
            ]
        ]);
    }

    /**
     * ✅ UPDATED: Update admin profile (all fields + photo)
     */
        public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'gender' => ['nullable', Rule::in(['male', 'female', 'other', 'prefer-not-to-say'])],
            'profile_photo' => 'nullable|image|mimes:png|max:2048',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'gender' => $request->gender,
        ];

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $photo = $request->file('profile_photo');
            $photoName = 'admin_profile_' . $user->id . '_' . time() . '.png';
            $photoPath = $photo->storeAs('profile-photos', $photoName, 'public');
            $updateData['profile_photo'] = $photoPath;
        }

        $user->update($updateData);
        
        // ✅ FIXED: Use fresh() to get latest data from database
        $user = $user->fresh();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'role' => $user->role,
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at?->format('M d, Y'),
            ]
        ]);
    }

    /**
     * Change password for admin
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}