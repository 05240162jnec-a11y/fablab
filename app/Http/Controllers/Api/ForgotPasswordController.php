<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    /**
     * Send password reset link to user's email
     */
    public function sendResetLink(Request $request)
    {
        // Validate email
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Find user
        $user = User::where('email', $request->email)->first();

        // Generate reset token
        $resetToken = Str::random(60);
        $user->reset_token = hash('sha256', $resetToken);
        $user->reset_token_expires_at = now()->addHours(1); // Token expires in 1 hour
        $user->save();

        // Build reset URL
        $resetUrl = url('/reset-password/' . $resetToken . '?email=' . urlencode($user->email));

        // Send email
        Mail::raw(
            "Hello {$user->name},\n\n" .
            "You requested to reset your password for JNEC Fab-Lab.\n\n" .
            "Click the link below to reset your password:\n" .
            "{$resetUrl}\n\n" .
            "This link will expire in 1 hour.\n\n" .
            "If you did not request this, please ignore this email.\n\n" .
            "Regards,\nJNEC Fab-Lab Team",
            function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Reset Your Password - JNEC Fab-Lab');
            }
        );

        return response()->json([
            'message' => 'Password reset link sent to your email!',
        ], 200);
    }

    /**
     * Reset user's password
     */
    public function resetPassword(Request $request)
    {
        // Validate request
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:8|confirmed',
        ]);

        // Find user
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        // Check if token matches
        if (hash('sha256', $request->token) !== $user->reset_token) {
            return response()->json([
                'message' => 'Invalid reset token',
            ], 400);
        }

        // Check if token is expired
        if ($user->reset_token_expires_at < now()) {
            return response()->json([
                'message' => 'Reset token has expired. Please request a new one.',
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->reset_token = null;
        $user->reset_token_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Password reset successful! You can now login with your new password.',
        ], 200);
    }
}