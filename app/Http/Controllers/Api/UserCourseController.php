<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserCourseController extends Controller
{
 /**
 * Get all available courses for user
 */
public function index()
{
    $user = Auth::user();

    // Get all active courses (both open and closed)
    $courses = Course::where('status', 'active')
        ->orderBy('start_date', 'asc')
        ->get()
        ->map(function ($course) use ($user) {
            // Check if user is enrolled in this course
            $userEnrollment = CourseEnrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->whereNull('unenrolled_at')
                ->first();

            $isEnrolled = $userEnrollment ? true : false;

            return [
                'id' => $course->id,
                'title' => $course->title,
                'instructor' => $course->instructor,
                'duration' => $course->duration,
                'schedule' => $course->schedule,
                'seat_limit' => $course->seat_limit,
                'enrollment' => $course->enrollment,
                'available_seats' => max(0, $course->seat_limit - $course->enrollment),
                'status' => $course->status,
                'description' => $course->description,
                'image' => $course->image,
                'start_date' => $course->start_date?->format('Y-m-d'),
                'end_date' => $course->end_date?->format('Y-m-d'),
                'registration_open' => $course->registration_open,
                'is_enrolled' => $isEnrolled,
            ];
        });

    return response()->json([
        'courses' => $courses,
    ]);
}

    /**
     * Get course details
     */
    public function show($id)
    {
        $course = Course::findOrFail($id);

        return response()->json([
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'instructor' => $course->instructor,
                'duration' => $course->duration,
                'schedule' => $course->schedule,
                'seat_limit' => $course->seat_limit,
                'enrollment' => $course->enrollment,
                'available_seats' => max(0, $course->seat_limit - $course->enrollment),
                'status' => $course->status,
                'description' => $course->description,
                'image' => $course->image,
                'start_date' => $course->start_date?->format('Y-m-d'),
                'end_date' => $course->end_date?->format('Y-m-d'),
                'registration_open' => $course->registration_open,
            ],
        ]);
    }

    /**
     * Get user's enrolled/completed courses
     */
    public function myCourses()
    {
        $user = Auth::user();

        $courses = $user->courses()
            ->with('course')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'course_id' => $enrollment->course_id,
                    'title' => $enrollment->course->title ?? 'Unknown Course',
                    'description' => $enrollment->course->description ?? '',
                    'status' => $enrollment->status,
                    'enrollment_data' => $enrollment->enrollment_data,
                    'enrolled_at' => $enrollment->created_at->format('Y-m-d'),
                    'completed_at' => $enrollment->completed_at?->format('Y-m-d'),
                    'start_date' => $enrollment->course->start_date?->format('Y-m-d'),
                    'end_date' => $enrollment->course->end_date?->format('Y-m-d'),
                ];
            });

        return response()->json([
            'courses' => $courses,
        ]);
    }

   /**
 * Enroll in a course
 */
public function enroll(Request $request, $id)
{
    $user = Auth::user();
    $course = Course::findOrFail($id);

    // Check if registration is open
    if (!$course->registration_open) {
        return response()->json(['message' => 'Registration is closed for this course.'], 422);
    }

    // Check if seats are available
    if ($course->enrollment >= $course->seat_limit) {
        return response()->json(['message' => 'No seats available for this course.'], 422);
    }

    // Check for ACTIVE enrollment only
    $existingEnrollment = CourseEnrollment::where('user_id', $user->id)
        ->where('course_id', $course->id)
        ->whereNull('unenrolled_at')
        ->first();

    if ($existingEnrollment) {
        return response()->json(['message' => 'You are already enrolled in this course.'], 422);
    }

    // Validate enrollment data
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'gender' => 'required|in:male,female,other',
        'phone' => 'required|string|max:20',
        'email' => 'required|email|max:255',
        'department' => 'nullable|string|max:255',
        'year' => 'nullable|integer|min:1|max:5',
    ]);

    // ✅ SIMPLIFIED LOGIC: Always increment on successful enroll
    DB::transaction(function () use ($user, $course, $validated) {
        // Check if user has a dropped enrollment that can be reactivated
        $droppedEnrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'dropped')
            ->whereNotNull('unenrolled_at')
            ->first();

        if ($droppedEnrollment) {
            // Reactivate the dropped enrollment
            $droppedEnrollment->update([
                'status' => 'enrolled',
                'unenrolled_at' => null,
                'enrollment_data' => $validated,
                'completed_at' => null,
            ]);
        } else {
            // Create brand new enrollment
            CourseEnrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'enrolled',
                'enrollment_data' => $validated,
            ]);
        }

        // ✅ Always increment enrollment count (with safety check)
        if ($course->enrollment < $course->seat_limit) {
            $course->increment('enrollment');
        }
    });

    // ✅ Refresh course data to ensure we return latest values
    $course->refresh();

    return response()->json([
        'message' => 'Successfully enrolled in course!',
        'enrollment' => [
            'course_title' => $course->title,
            'start_date' => $course->start_date?->format('Y-m-d'),
            'end_date' => $course->end_date?->format('Y-m-d'),
            'current_enrollment' => $course->enrollment, // ✅ For debugging
        ],
    ], 201);
}

    /**
 * Unenroll from a course
 */
public function unenroll(Request $request, $id)
{
    $user = Auth::user();
    $course = Course::findOrFail($id);

    // ✅ Find ACTIVE enrollment only
    $enrollment = CourseEnrollment::where('user_id', $user->id)
        ->where('course_id', $course->id)
        ->whereNull('unenrolled_at')  // ✅ Critical check!
        ->first();

    // ✅ If no active enrollment, user can't unenroll
    if (!$enrollment) {
        return response()->json([
            'message' => 'You are not enrolled in this course.',
        ], 422);
    }

    // Check if registration is still open
    if (!$course->registration_open) {
        return response()->json([
            'message' => 'Registration is closed. Contact admin to unenroll.',
        ], 422);
    }

    // Unenroll
    DB::transaction(function () use ($enrollment, $course) {
        $enrollment->update([
            'unenrolled_at' => now(),
            'status' => 'dropped',
        ]);

        // ✅ FIX: Only decrement if enrollment > 0
        if ($course->enrollment > 0) {
            $course->decrement('enrollment');
        }
    });

    return response()->json([
        'message' => 'Successfully unenrolled from course.',
    ]);
}
}