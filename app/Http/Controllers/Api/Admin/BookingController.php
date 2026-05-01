<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Get all bookings with filters
    public function index(Request $request)
    {
        $query = Booking::with(['user:id,name,email', 'machine:id,name,type']);

        // Filter by machine type
        if ($request->has('machine') && $request->machine !== 'all') {
            $query->whereHas('machine', function($q) use ($request) {
                $q->where('type', 'like', "%{$request->machine}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date') && $request->date) {
            $query->whereDate('booking_date', $request->date);
        }

        // Search
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

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated',
            'data' => $booking
        ]);
    }
}