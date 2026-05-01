<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Get authenticated user's profile
     */
    public function profile()
    {
        $user = Auth::user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'gender' => $user->gender,
                'phone' => $user->phone,
                'department' => $user->department,
                'year_of_study' => $user->year_of_study,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}