<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $role = $this->detectRole($googleUser->email);

            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                $user = User::create([
                    'name'     => $googleUser->name,
                    'email'    => $googleUser->email,
                    'password' => Hash::make(uniqid()),
                    'role'     => $role,
                    'avatar'   => $googleUser->avatar,
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            $userData = urlencode(json_encode([
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ]));

            // Fixed: changed port from 3000 to 5173
            return redirect(
                'http://localhost:5173/google/callback?token=' . $token . '&user=' . $userData
            );

        } catch (\Exception $e) {
            return redirect('http://localhost:5173/login?error=google_failed');
        }
    }

    private function detectRole($email)
    {
        if (preg_match('/^\d+\.jnec@rub\.edu\.bt$/', $email)) {
            return 'student';
        }
        if (preg_match('/^[a-zA-Z]+\.jnec@rub\.edu\.bt$/', $email)) {
            return 'staff';
        }
        return 'others';
    }
}