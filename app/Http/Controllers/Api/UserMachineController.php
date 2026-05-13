<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UserMachineController extends Controller
{
    /**
     * Get all available machines for users
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Machine::where('status', 'available');

        // Search by name or type
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $machines = $query->latest()->get()->map(function($machine) use ($user) {
            // ✅ CORRECT LOGIC: Check if user has completed ANY course
            $hasTraining = $user->courses()
                ->whereIn('status', ['completed'])  // Only 'completed' counts
                ->exists();
            
            return [
                'id' => $machine->id,
                'name' => $machine->name,
                'category' => $machine->category ?? 'General',
                'type' => $machine->type ?? 'General',
                'status' => $machine->status,
                'description' => $machine->description,
                'image' => $machine->image,
                'location' => $machine->location ?? 'Main Lab',
                'has_required_training' => $hasTraining,  // ✅ Based on ANY completed course
                'required_course' => null,  // Not machine-specific
                'required_course_names' => [],
                'added_on' => $machine->created_at,
            ];
        });

        return response()->json([
            'machines' => $machines,
        ]);
    }

    /**
     * Get booked dates for a machine
     */
    public function bookedDates($machineId)
    {
        $bookedDates = Booking::where('machine_id', $machineId)
            ->where('status', '!=', 'cancelled')
            ->where('start_date', '>=', now())
            ->get()
            ->flatMap(function ($booking) {
                $start = Carbon::parse($booking->start_date);
                $end = Carbon::parse($booking->end_date);
                $dates = [];
                
                while ($start <= $end) {
                    $dates[] = $start->format('Y-m-d');
                    $start->addDay();
                }
                
                return $dates;
            })
            ->unique()
            ->values();

        return response()->json([
            'dates' => $bookedDates,
        ]);
    }
}