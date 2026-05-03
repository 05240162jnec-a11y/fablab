<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use App\Models\Booking;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UserMachineController extends Controller
{
    /**
     * Get all available machines for user with training check
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get user's completed course IDs
        $completedCourseIds = CourseEnrollment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->pluck('course_id')
            ->toArray();

        $machines = Machine::where('status', '!=', 'deleted')
            ->orderBy('name')
            ->get()
            ->map(function ($machine) use ($completedCourseIds) {
                // Decode required_courses from JSON
                $requiredCourses = json_decode($machine->required_courses, true) ?? [];
                
                // Check if user has completed ANY of the required courses
                $hasTraining = false;
                if (empty($requiredCourses)) {
                    // No requirements = anyone can book
                    $hasTraining = true;
                } else {
                    // Check if any required course is in user's completed list
                    foreach ($requiredCourses as $courseId) {
                        if (in_array($courseId, $completedCourseIds)) {
                            $hasTraining = true;
                            break;
                        }
                    }
                }

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
                    
                    // ✅ Training requirement fields
                    'required_courses' => $requiredCourses,  // Array of course IDs
                    'required_course_names' => $this->getCourseNames($requiredCourses),  // Human-readable names
                    'has_required_training' => $hasTraining,  // ✅ Key field for frontend
                ];
            });

        return response()->json([
            'machines' => $machines,
        ]);
    }

    /**
     * Helper: Get course names for display
     */
    private function getCourseNames($courseIds)
    {
        if (empty($courseIds)) {
            return ['No training required'];
        }
        
        return \App\Models\Course::whereIn('id', $courseIds)
            ->pluck('title')
            ->toArray();
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