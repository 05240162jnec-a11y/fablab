<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserMachineController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();

            // ✅ FIXED: Only get available machines (exclude maintenance)
            $machines = Machine::where('status', 'available')
                ->select('id', 'name', 'type', 'description', 'required_course', 'status', 'image', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($machine) use ($user) {
                    // Simple training check - does user have ANY completed course?
                    $hasTraining = $user->courses()
                        ->wherePivot('status', 'completed')
                        ->exists();

                    return [
                        'id' => $machine->id,
                        'name' => $machine->name,
                        'category' => $machine->type ?? 'General',
                        'description' => $machine->description,
                        // ✅ FIXED: Ensure image path is correct
                        'image' => $machine->image ? asset('storage/' . $machine->image) : asset('images/default-machine.png'),
                        'location' => 'Fab Lab',
                        'status' => $machine->status,
                        'has_required_training' => !empty($machine->required_course),
                        'required_course_title' => $machine->required_course,
                        'has_training' => $hasTraining,
                        'created_at' => $machine->created_at->toISOString(),
                    ];
                });

            Log::info('UserMachineController: Returning ' . $machines->count() . ' available machines');

            return response()->json([
                'success' => true,
                'machines' => $machines
            ]);
            
        } catch (\Exception $e) {
            Log::error('UserMachineController index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'machines' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

        /**
     * Get booked dates for a specific machine
     */
    public function bookedDates($id)
    {
        try {
            // Check if machine is available before showing dates
            $machine = Machine::findOrFail($id);
            
            if ($machine->status !== 'available') {
                return response()->json([
                    'success' => false,
                    'message' => 'This machine is currently under maintenance and cannot be booked.',
                    'dates' => []
                ], 422);
            }

            // Get all confirmed bookings for this machine
            $bookings = \App\Models\Booking::where('machine_id', $id)
                ->where('status', 'confirmed')
                ->where('start_date', '>=', now()->startOfDay())
                ->get();

            // ✅ FIXED: Generate ALL dates in the booking range (not just start_date)
            $dates = collect();
            
            foreach ($bookings as $booking) {
                $startDate = \Carbon\Carbon::parse($booking->start_date);
                $endDate = \Carbon\Carbon::parse($booking->end_date);
                
                // Loop through each day in the range and add it to the collection
                while ($startDate->lte($endDate)) {
                    $dates->push($startDate->format('Y-m-d'));
                    $startDate->addDay();
                }
            }

            return response()->json([
                'success' => true,
                'dates' => $dates->unique()->values() // Remove duplicates and re-index
            ]);
            
        } catch (\Exception $e) {
            \Log::error('UserMachineController bookedDates error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'dates' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }
}