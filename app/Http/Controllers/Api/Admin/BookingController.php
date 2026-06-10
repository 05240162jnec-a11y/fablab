<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Mail\BookingTerminatedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Notifications\BookingStatusNotification;

class BookingController extends Controller
{
    // Get all bookings with filters
    public function index(Request $request)
    {
        $query = Booking::with(['user:id,name,email', 'machine:id,name,type']);

        if ($request->has('machine') && $request->machine !== 'all') {
            $query->whereHas('machine', function($q) use ($request) {
                $q->where('type', 'like', "%{$request->machine}%");
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date') && $request->date) {
            $query->whereDate('booking_date', $request->date);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('machine', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $bookings = $query->latest()->get();

        return response()->json(['success' => true, 'data' => $bookings]);
    }

    // Update booking status
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:upcoming,completed,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->status = $validated['status'];
        $booking->save();

        // Notify user
        if ($booking->user) {
            $booking->user->notify(new BookingStatusNotification($booking->load('machine'), $validated['status']));
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated',
            'data'    => $booking
        ]);
    }

    // Terminate booking for no-show (admin action)
    public function terminateBooking($id)
    {
        $booking = Booking::with(['user', 'machine'])->findOrFail($id);

        if (!in_array($booking->status, ['confirmed', 'upcoming'])) {
            return response()->json(['message' => 'This booking cannot be terminated.'], 422);
        }

        try {
            Mail::to($booking->user->email)->send(new BookingTerminatedMail($booking));
        } catch (\Exception $e) {
            \Log::error('Termination email failed: ' . $e->getMessage());
        }

        $booking->status = 'terminated';
        $booking->save();

        // Notify user in-app
        if ($booking->user) {
            $booking->user->notify(new BookingStatusNotification($booking, 'terminated'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking terminated. User notified.',
            'data'    => $booking
        ]);
    }
}