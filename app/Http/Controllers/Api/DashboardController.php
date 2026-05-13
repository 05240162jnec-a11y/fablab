<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Get user dashboard data
     */
    public function userDashboard()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // ✅ Get booking stats
        $totalBookings = Booking::where('user_id', $user->id)->count();
        
        $pendingBookings = Booking::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();
        
        $approvedBookings = Booking::where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->count();

        // ✅ Get course stats
        $ongoingCourses = CourseEnrollment::where('user_id', $user->id)
            ->whereIn('status', ['enrolled', 'in_progress'])
            ->count();

        // ✅ Get available courses (limit 4)
        $courses = Course::where('status', 'open')
            ->latest()
            ->limit(4)
            ->get()
            ->map(function ($course) use ($user) {
                $isEnrolled = CourseEnrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->exists();
                
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'duration' => $course->duration ?? '4 weeks',
                    'status' => $course->status,
                    'enrolled' => $isEnrolled,
                ];
            });

        // ✅ Get recent activity (latest 5 bookings)
        $recentActivity = Booking::where('user_id', $user->id)
            ->with('machine')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'action' => 'Booked ' . ($booking->machine->name ?? 'Machine'),
                    'date' => $booking->created_at ? $booking->created_at->format('M j, Y') : '',
                    'status' => ucfirst($booking->status ?? 'pending'),
                ];
            });

        // ✅ Return JSON response (announcements as empty array)
        return response()->json([
            'student' => [
                'name' => $user->name,
                'email' => $user->email,
                'department' => $user->department ?? 'Student',
                'year_of_study' => $user->year_of_study,
            ],
            'stats' => [
                'totalBookings' => $totalBookings,
                'pendingBookings' => $pendingBookings,
                'approvedBookings' => $approvedBookings,
                'ongoingCourses' => $ongoingCourses,
            ],
            'announcements' => [],  // ✅ Empty array - no Announcement model
            'courses' => $courses,
            'recentActivity' => $recentActivity,
        ]);
    }
}