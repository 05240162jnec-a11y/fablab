<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Machine;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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

        // Check if machine is available
        if ($machine->status !== 'available') {
            return response()->json([
                'message' => 'This machine is not available for booking.',
            ], 422);
        }

        // Check training requirement
        if ($machine->required_course) {
            $hasTraining = $user->courses()
                ->where('course_id', function ($query) use ($machine) {
                    $query->select('id')
                          ->from('courses')
                          ->where('title', $machine->required_course);
                })
                ->whereIn('status', ['completed', 'enrolled'])
                ->exists();

            if (!$hasTraining) {
                return response()->json([
                    'message' => 'You must complete the required training before booking this machine.',
                ], 422);
            }
        }

        // Check if dates are available
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
            'status' => 'confirmed', // Instant booking, no approval needed
            'purpose' => $request->purpose ?? 'General use',
        ]);

        return response()->json([
            'message' => 'Booking confirmed successfully!',
            'booking' => [
                'id' => $booking->id,
                'machine_name' => $machine->name,
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
                return [
                    'id' => $booking->id,
                    'machine_name' => $booking->machine->name ?? 'Unknown Machine',
                    'start_date' => $booking->start_date,
                    'end_date' => $booking->end_date,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at->format('Y-m-d'),
                ];
            });

        return response()->json([
            'bookings' => $bookings,
        ]);
    }
}