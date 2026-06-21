<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\NewUserRegisteredNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Registered;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 🔐 SECURITY: Block the admin email from public registration
        $blockedEmail = 'fablab.jnec@rub.edu.bt';
        
        if (strtolower($request->email) === strtolower($blockedEmail)) {
            return response()->json([
                'message' => 'This email is reserved for administrative use. Please contact support.',
            ], 403);
        }

        // ← 🔐 Role-based email validation
        
        // 1. STUDENT: Must be 8digits.jnec@rub.edu.bt
        if ($request->role === 'student') {
            if (!preg_match('/^\d{8}\.jnec@rub\.edu\.bt$/', $request->email)) {
                return response()->json([
                    'message' => 'Invalid student email. Please use your official student email address.',
                ], 422);
            }
        }

        // 2. FACULTY: Must be name.jnec@rub.edu.bt
        if ($request->role === 'faculty') {
            if (!preg_match('/^[a-zA-Z0-9._-]+\.jnec@rub\.edu\.bt$/', $request->email)) {
                return response()->json([
                    'message' => 'Invalid faculty email. Please use your official faculty email address.',
                ], 422);
            }
        }

        // 3. PRODUCTION TEAM: Must be official JNEC email (like faculty)
        if ($request->role === 'production_team') {
            if (!preg_match('/^[a-zA-Z0-9._-]+\.jnec@rub\.edu\.bt$/', $request->email)) {
                return response()->json([
                    'message' => 'Invalid production team email. Please use your official JNEC email address.',
                ], 422);
            }
        }

        // 4. OUTSIDER: Cannot use @jnec@rub.edu.bt domain
        if ($request->role === 'outsider') {
            if (str_ends_with(strtolower($request->email), '.jnec@rub.edu.bt')) {
                return response()->json([
                    'message' => 'College email addresses are only for students and faculty.',
                ], 422);
            }
        }

        try {
            // Validation
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => [
                    'required',
                    'min:8',
                    'confirmed',
                    // Custom validation for password strength
                    function ($attribute, $value, $fail) {
                        // Check uppercase
                        if (!preg_match('/[A-Z]/', $value)) {
                            $fail('Password must contain at least one uppercase letter.');
                        }
                        
                        // Check lowercase
                        if (!preg_match('/[a-z]/', $value)) {
                            $fail('Password must contain at least one lowercase letter.');
                        }
                        
                        // Check numbers
                        if (!preg_match('/[0-9]/', $value)) {
                            $fail('Password must contain at least one number.');
                        }
                        
                        // Check special characters
                        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'"\\\\|,.<>\/?]/', $value)) {
                            $fail('Password must contain at least one special character (!@#$%^&*).');
                        }
                        
                        // Check weak passwords
                        $weakPasswords = [
                            'password', 'password123', '12345678', '123456789', 'qwerty',
                            'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
                            'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
                            'ashley', 'bailey', 'shadow', 'superman', 'qazwsx',
                            '123123', 'admin', 'welcome', 'jennifer', 'login'
                        ];
                        
                        if (in_array(strtolower($value), $weakPasswords)) {
                            $fail('Password is too common. Please choose a stronger password.');
                        }
                    },
                ],
                'gender' => 'required|in:male,female,other',
                'phone' => 'required|string|max:20',
                'country_code' => 'nullable|string|max:3',
                'role' => 'required|in:student,faculty,outsider,production_team',
                'department' => 'nullable|string|max:255',
                'year_of_study' => 'nullable|integer|min:1|max:4',
            ]);

            // ← Manual phone validation based on country
            $phone = $validated['phone'];

            // Bhutan: 17xxxxxx or 77xxxxxx (8 digits)
            $bhutanPattern = '/^(17|77)\d{6}$/';

            // International: 7-15 digits (without + or country code)
            $internationalPattern = '/^\d{7,15}$/';

            if (!preg_match($bhutanPattern, $phone) && !preg_match($internationalPattern, $phone)) {
                return response()->json([
                    'message' => 'Phone number format is invalid.',
                    'errors' => [
                        'phone' => ['Phone number must be 8 digits for Bhutan (17/77XXXXXX) or 7-15 digits for international numbers.']
                    ]
                ], 422);
            }

            // ← Create the user!
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'gender' => $validated['gender'],
                'phone' => $validated['phone'],
                'country_code' => $validated['country_code'] ?? 'BT',
                'role' => $validated['role'],
                'department' => $validated['department'] ?? null,
                'year_of_study' => $validated['year_of_study'] ?? null,
                'email_verified_at' => null,
            ]);

            // Send verification email
            event(new Registered($user));

            // Notify admins of new registration
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new NewUserRegisteredNotification($user));
            }

            return response()->json([
                'message' => 'Registration successful! Please check your email to verify your account.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified' => $user->email_verified_at !== null,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

        public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // ✅ Use withTrashed() to include soft-deleted users
    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Invalid credentials'],
        ]);
    }

    // ✅ Check if user account is disabled (is_active = false)
    if (!$user->is_active) {
        return response()->json([
            'message' => 'Your account has been disabled. Please contact the administrator for assistance.',
        ], 403);
    }

    // ✅ Track first login for production team members
    if ($user->role === 'production_team' && $user->email_verified_at === null) {
        $user->email_verified_at = Carbon::now();
        $user->save();
    }

    // 🔐 Check if email is verified (SKIP for admin & production_team)
    if (!$user->hasVerifiedEmail() && !in_array($user->role, ['admin', 'production_team'])) {
        return response()->json([
            'message' => 'Please verify your email first. Check your inbox for the verification link.',
        ], 403);
    }

    // Create token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'email_verified' => $user->email_verified_at !== null,
        ],
        'token' => $token,
        'token_type' => 'Bearer',
    ], 200);
}
}