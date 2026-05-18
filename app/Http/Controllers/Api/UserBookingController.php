<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Machine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserBookingController extends Controller
{
    /**
 * Create a new machine booking
 */
public function store(Request $request)
{
    // Validate request
    $request->validate([
        'machine_id' => 'required|exists:machines,id',
        'start_date' => 'required|date|after_or_equal:today',
        'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    $user = Auth::user();
    $machine = Machine::findOrFail($request->machine_id);

    // ✅ GLOBAL TRAINING CHECK (Your intended logic):
    // User must have completed at least ONE course to book ANY machine
    $hasCompletedAnyCourse = $user->courses()
        ->wherePivot('status', 'completed')
        ->exists();
    
    if (!$hasCompletedAnyCourse) {
        return response()->json([
            'message' => 'You must complete at least one training course before booking machines. Please enroll in and complete a course first.',
            'help' => 'Visit the Courses page to find available training sessions.',
        ], 403); // 403 = Forbidden (not 422)
    }

    // Check if machine is available
    if ($machine->status !== 'available') {
        return response()->json([
            'message' => 'This machine is not available for booking.',
        ], 422);
    }

    // Check if dates are available (no overlap with existing bookings)
    $existingBookings = Booking::where('machine_id', $machine->id)
        ->where('status', '!=', 'cancelled')
        ->where(function ($query) use ($request) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                  ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                  ->orWhere(function ($q) use ($request) {
                      $q->where('start_date', '<=', $request->start_date)
                        ->where('end_date', '>=', $request->end_date);
                  });
        })
        ->exists();

    if ($existingBookings) {
        return response()->json([
            'message' => 'Selected dates overlap with existing bookings. Please choose different dates.',
        ], 422);
    }

    // Create booking
    $booking = Booking::create([
        'user_id' => $user->id,
        'machine_id' => $machine->id,
        'start_date' => $request->start_date,
        'end_date' => $request->end_date,
        'booking_date' => $request->start_date,
        'start_time' => '09:00:00',
        'end_time' => '17:00:00',
        'status' => 'confirmed',
    ]);

    return response()->json([
        'message' => 'Booking confirmed successfully!',
        'booking' => [
            'id' => $booking->id,
            'machine_id' => $machine->id,
            'machine_name' => $machine->name,
            'machine_type' => $machine->type,
            'machine_location' => $machine->location ?? 'Fab Lab',
            'machine_image' => $machine->image ? asset('storage/' . $machine->image) : null,
            'start_date' => $booking->start_date,
            'end_date' => $booking->end_date,
            'status' => $booking->status,
        ],
    ], 201);
}

    /**
     * Get user's bookings
     */
    public function myBookings()
    {
        $user = Auth::user();

        $bookings = Booking::with('machine')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                $machine = $booking->machine;

                return [
                    'id' => $booking->id,
                    'machine_id' => $booking->machine_id,
                    'machine_name' => $machine->name ?? 'Unknown Machine',
                    'machine_type' => $machine->type ?? null,
                    'machine_location' => $machine->location ?? 'Fab Lab',
                    'machine_image' => $machine && $machine->image ? asset('storage/' . $machine->image) : null,
                    'start_date' => $booking->start_date,
                    'end_date' => $booking->end_date,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at?->format('Y-m-d'),
                ];
            });

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    /**
     * Cancel a booking
     */
    public function cancel($id)
    {
        $user = Auth::user();

        // Find booking by ID and ensure it belongs to authenticated user
        $booking = Booking::where('user_id', $user->id)
            ->findOrFail($id);

        // Check if booking can be cancelled (only active bookings)
        if (!in_array($booking->status, ['confirmed', 'booked', 'pending'])) {
            return response()->json([
                'success' => false,
                'message' => 'This booking cannot be cancelled'
            ], 400);
        }

        // Update status to cancelled
        $booking->status = 'cancelled';
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully. The date is now available for other users.'
        ]);
    }
}