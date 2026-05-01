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
     * Get all available machines for user
     */
    public function index()
    {
        $machines = Machine::where('status', '!=', 'deleted')
            ->orderBy('name')
            ->get()
            ->map(function ($machine) {
                return [
                    'id' => $machine->id,
                    'name' => $machine->name,
                    'category' => $machine->category,
                    'type' => $machine->type,
                    'status' => $machine->status,
                    'description' => $machine->description,
                    'location' => $machine->location,
                    'specs' => $machine->specs,
                    'added_on' => $machine->created_at->format('Y-m-d'),
                    'required_course' => $machine->required_course,
                ];
            });

        return response()->json([
            'machines' => $machines,
        ]);
    }

    /**
     * Get booked dates for a specific machine
     */
    public function bookedDates($machineId)
    {
        $bookedDates = Booking::where('machine_id', $machineId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) {
                $query->where('start_date', '>=', Carbon::today())
                      ->orWhere('end_date', '>=', Carbon::today());
            })
            ->get()
            ->flatMap(function ($booking) {
                // Return all dates in the booking range
                $dates = [];
                $start = Carbon::parse($booking->start_date);
                $end = Carbon::parse($booking->end_date);
                
                while ($start->lte($end)) {
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