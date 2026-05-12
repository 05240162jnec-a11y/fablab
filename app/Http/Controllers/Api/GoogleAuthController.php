<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // redirect user to google login page
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // handle google callback after login
    public function callback()
    {
        try {
            // get user info from google
            $googleUser = Socialite::driver('google')->stateless()->user();

            // check if user already exists in database
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // create new user if not exists
                $user = User::create([
                    'name'         => $googleUser->getName(),
                    'email'        => $googleUser->getEmail(),
                    'password'     => bcrypt('google-auth-' . rand(1000, 9999)),
                    'role'         => 'user',
                    'account_type' => 'external',
                    'is_trained'   => false,
                ]);
            }

            // create token for user
            $token = $user->createToken('auth_token')->plainTextToken;

            // redirect to React frontend with token
            return redirect("http://localhost:5173/auth/google/callback?token=" . $token . "&user=" . urlencode(json_encode($user)));

        } catch (\Exception $e) {
            return redirect("http://localhost:5173/login?error=google_auth_failed");
        }
    }
}