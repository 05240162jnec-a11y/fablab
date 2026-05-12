<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use App\Models\MachineBooking;
use Illuminate\Http\Request;

class MachineBookingController extends Controller
{
    // get available time slots for a machine on a date
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'machine_id'   => 'required|integer',
            'booking_date' => 'required|date',
        ]);

        // all possible time slots 9 AM to 4 PM
        $allSlots = [
            ['start' => '09:00', 'end' => '10:00'],
            ['start' => '10:00', 'end' => '11:00'],
            ['start' => '11:00', 'end' => '12:00'],
            ['start' => '13:00', 'end' => '14:00'],
            ['start' => '14:00', 'end' => '15:00'],
            ['start' => '15:00', 'end' => '16:00'],
        ];

        // get booked slots for this machine on this date
        $bookedSlots = MachineBooking::where('machine_id', $request->machine_id)
            ->where('booking_date', $request->booking_date)
            ->whereIn('status', ['pending', 'approved'])
            ->get(['start_time', 'end_time']);

        // mark slots as available or booked
        $slots = array_map(function ($slot) use ($bookedSlots) {
            $isBooked = $bookedSlots->contains(function ($booked) use ($slot) {
                return $booked->start_time === $slot['start'];
            });
            return [
                'start'     => $slot['start'],
                'end'       => $slot['end'],
                'available' => !$isBooked,
            ];
        }, $allSlots);

        return response()->json($slots);
    }

    // book a machine
    public function store(Request $request)
    {
        $request->validate([
            'machine_id'   => 'required|integer',
            'booking_date' => 'required|date',
            'start_time'   => 'required|string',
            'end_time'     => 'required|string',
            'purpose'      => 'nullable|string',
        ]);

        $machine = Machine::findOrFail($request->machine_id);

        // check if machine is available
        if ($machine->status !== 'available') {
            return response()->json([
                'message' => 'This machine is currently not available for booking.',
            ], 400);
        }

        // check if user has training certificate
        if ($machine->requires_training && !$request->user()->is_trained) {
            return response()->json([
                'message' => 'You must complete training before booking this machine.',
            ], 403);
        }

        // check if slot is already booked
        $existingBooking = MachineBooking::where('machine_id', $request->machine_id)
            ->where('booking_date', $request->booking_date)
            ->where('start_time', $request->start_time)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingBooking) {
            return response()->json([
                'message' => 'This time slot is already booked. Please choose another slot.',
            ], 400);
        }

        // create booking
        $booking = MachineBooking::create([
            'user_id'      => $request->user()->id,
            'machine_id'   => $request->machine_id,
            'booking_date' => $request->booking_date,
            'start_time'   => $request->start_time,
            'end_time'     => $request->end_time,
            'purpose'      => $request->purpose,
            'status'       => 'pending',
        ]);

        return response()->json([
            'message' => 'Machine booked successfully! Waiting for admin approval.',
            'booking' => $booking,
        ], 201);
    }

    // get user bookings
    public function userBookings(Request $request)
    {
        $bookings = MachineBooking::with('machine')
            ->where('user_id', $request->user()->id)
            ->orderBy('booking_date', 'desc')
            ->get();

        return response()->json($bookings);
    }

    // get all bookings - admin
    public function adminBookings()
    {
        $bookings = MachineBooking::with(['user', 'machine'])
            ->orderBy('booking_date', 'desc')
            ->get();

        return response()->json($bookings);
    }

    // update booking status - admin
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'     => 'required|string|in:pending,approved,rejected,completed',
            'admin_note' => 'nullable|string',
        ]);

        $booking = MachineBooking::findOrFail($id);
        $booking->status     = $request->status;
        $booking->admin_note = $request->admin_note;
        $booking->save();

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking,
        ]);
    }

    // cancel booking - user
    public function cancel(Request $request, $id)
    {
        $booking = MachineBooking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $booking->status = 'rejected';
        $booking->save();

        return response()->json(['message' => 'Booking cancelled successfully']);
    }
}