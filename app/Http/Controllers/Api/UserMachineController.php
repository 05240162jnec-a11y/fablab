<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserMachineController extends Controller
{
  public function index()
{
    try {
        $user = Auth::user();

        // Get all available machines
        $machines = \App\Models\Machine::where('status', 'available')
            ->select('id', 'name', 'type as category', 'description', 'required_course', 'status', 'image', 'created_at')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($machine) use ($user) {
                // Simple training check - does user have ANY completed course?
                $hasTraining = $user->courses()
                    ->wherePivot('status', 'completed')
                    ->exists();

                return [
                    'id' => $machine->id,
                    'name' => $machine->name,
                    'category' => $machine->category ?? 'General',
                    'description' => $machine->description,
                    'image' => $machine->image ? asset('storage/' . $machine->image) : null,
                    'location' => 'Fab Lab',
                    'status' => $machine->status,
                    'has_required_training' => !empty($machine->required_course),
                    'required_course_title' => $machine->required_course,
                    'has_training' => $hasTraining,
                    'created_at' => $machine->created_at,
                ];
            });

        return response()->json(['machines' => $machines]);
        
    } catch (\Exception $e) {
        \Log::error('UserMachineController index error: ' . $e->getMessage());
        return response()->json(['machines' => [], 'error' => $e->getMessage()], 500);
    }
}

    /**
     * Get booked dates for a specific machine
     */
    public function bookedDates($id)
    {
        try {
            // Get all confirmed bookings for this machine
            $bookings = \App\Models\Booking::where('machine_id', $id)
                ->where('status', 'confirmed')
                ->where('start_date', '>=', now()->startOfDay())
                ->pluck('start_date')
                ->map(fn($date) => $date->format('Y-m-d'));

            return response()->json(['dates' => $bookings]);
            
        } catch (\Exception $e) {
            \Log::error('UserMachineController bookedDates error: ' . $e->getMessage());
            return response()->json(['dates' => [], 'error' => 'Failed to load booked dates'], 200);
        }
    }
}