<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    // Send PIN to email
    public function sendPin(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Generate 6 digit PIN
        $pin = rand(100000, 999999);

        // Delete old pins for this email
        DB::table('password_reset_pins')
            ->where('email', $request->email)
            ->delete();

        // Save new PIN
        DB::table('password_reset_pins')->insert([
            'email'      => $request->email,
            'pin'        => $pin,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send email
        Mail::send([], [], function ($message) use ($request, $pin) {
            $message->to($request->email)
                ->subject('JNEC FabLab - Password Reset PIN')
                ->html("
                    <div style='font-family: Arial; max-width: 500px; margin: 0 auto;'>
                        <h2 style='color: #e67e22;'>JNEC FabLab</h2>
                        <h3>Password Reset PIN</h3>
                        <p>Your PIN code is:</p>
                        <div style='font-size: 36px; font-weight: bold; color: #e67e22; 
                            letter-spacing: 10px; padding: 20px; background: #f1f5f9; 
                            border-radius: 8px; text-align: center;'>
                            {$pin}
                        </div>
                        <p style='color: #64748b; margin-top: 20px;'>
                            This PIN expires in 10 minutes.
                        </p>
                        <p style='color: #64748b;'>
                            If you did not request this, please ignore this email.
                        </p>
                    </div>
                ");
        });

        return response()->json([
            'message' => 'PIN sent to your email!'
        ], 200);
    }

    // Verify PIN
    public function verifyPin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'pin'   => 'required|string',
        ]);

        $record = DB::table('password_reset_pins')
            ->where('email', $request->email)
            ->where('pin', $request->pin)
            ->first();

        if (!$record) {
            return response()->json([
                'errors' => ['pin' => ['Invalid PIN!']]
            ], 422);
        }

        if (now()->isAfter($record->expires_at)) {
            return response()->json([
                'errors' => ['pin' => ['PIN has expired! Please request a new one.']]
            ], 422);
        }

        return response()->json([
            'message' => 'PIN verified successfully!'
        ], 200);
    }

    // Reset Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'pin'      => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_pins')
            ->where('email', $request->email)
            ->where('pin', $request->pin)
            ->first();

        if (!$record) {
            return response()->json([
                'errors' => ['pin' => ['Invalid PIN!']]
            ], 422);
        }

        if (now()->isAfter($record->expires_at)) {
            return response()->json([
                'errors' => ['pin' => ['PIN has expired!']]
            ], 422);
        }

        // Update password
        User::where('email', $request->email)
            ->update(['password' => Hash::make($request->password)]);

        // Delete used PIN
        DB::table('password_reset_pins')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'message' => 'Password reset successfully!'
        ], 200);
    }
}