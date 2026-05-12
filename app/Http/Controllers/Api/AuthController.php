<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // REGISTER - creates a new user account
    public function register(Request $request)
    {
        // check all inputs are correct
        $request->validate([
            'name'         => 'required|string',
            'cid'          => 'nullable|string',
            'gender'       => 'nullable|string',
            'phone'        => 'nullable|string',
            'account_type' => 'required|string', // student, staff, external
            'email'        => 'required|email|unique:users',
            'password'     => 'required|min:6',
        ]);

        // save new user to database
        $user = User::create([
            'name'         => $request->name,
            'cid'          => $request->cid,
            'gender'       => $request->gender,
            'phone'        => $request->phone,
            'account_type' => $request->account_type,
            'email'        => $request->email,
            'password'     => Hash::make($request->password), // encrypt password
            'role'         => 'user',                          // default role
            'is_trained'   => false,                           // not trained yet
        ]);

        // create token for new user
        $token = $user->createToken('auth_token')->plainTextToken;

        // send back success message
        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    // LOGIN - check email and password
    public function login(Request $request)
    {
        // check email and password are filled
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // if wrong email or password return error
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        // if correct get user and create token
        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        // send back success with token and user info
        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    // LOGOUT - delete token so user is logged out
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
