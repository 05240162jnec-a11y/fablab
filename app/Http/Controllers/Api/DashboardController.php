<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Course;
use App\Models\CustomOrder;
use App\Models\Project;
use App\Models\Gallery;
use App\Models\FAQ;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics and recent activity
     */
    public function index()
    {
        // Get counts from database
        $totalUsers = User::where('role', 'student')->count();
        $activeBookings = Booking::whereIn('status', ['pending', 'confirmed'])->count();
        $ongoingCourses = Course::where('status', 'ongoing')->count();
        $pendingOrders = CustomOrder::where('status', 'pending')->count();

        // Get recent activity (combine from multiple sources)
        $recentActivity = $this->getRecentActivity();

        return response()->json([
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeBookings' => $activeBookings,
                'ongoingCourses' => $ongoingCourses,
                'pendingOrders' => $pendingOrders,
            ],
            'recentActivity' => $recentActivity,
            'quickStats' => [
                'totalProjects' => Project::count(),
                'totalGalleryImages' => Gallery::count(),
                'totalFAQs' => FAQ::count(),
            ],
        ]);
    }

    /**
 * Get recent activity from various sources
 */
private function getRecentActivity()
{
    $activities = [];

    // Recent bookings
    $recentBookings = Booking::with('user')
        ->latest()
        ->take(3)
        ->get()
        ->map(function ($booking) {
            return [
                'id' => $booking->id,
                'user_name' => $booking->user?->name ?? 'Unknown User',
                'user_initials' => $this->getInitials($booking->user?->name ?? 'Unknown'),
                'action' => 'booked',
                'target' => $booking->machine_name ?? 'a machine',
                'time' => $booking->created_at->diffForHumans(),
                'type' => 'Booking',
            ];
        });

    // Recent orders
    $recentOrders = CustomOrder::with('user')
        ->latest()
        ->take(2)
        ->get()
        ->map(function ($order) {
            return [
                'id' => $order->id,
                'user_name' => $order->user?->name ?? 'Unknown User',
                'user_initials' => $this->getInitials($order->user?->name ?? 'Unknown'),
                'action' => 'submitted',
                'target' => 'custom order for ' . ($order->service_type ?? 'fabrication'),
                'time' => $order->created_at->diffForHumans(),
                'type' => 'Order',
            ];
        });

    // Recent course enrollments (only if table exists)
    $recentEnrollments = collect([]);
    try {
        if (Schema::hasTable('course_enrollments')) {
            $recentEnrollments = DB::table('course_enrollments')
                ->join('users', 'course_enrollments.user_id', '=', 'users.id')
                ->join('courses', 'course_enrollments.course_id', '=', 'courses.id')
                ->select('users.name', 'courses.title as course_title', 'course_enrollments.created_at')
                ->latest('course_enrollments.created_at')
                ->take(2)
                ->get()
                ->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->created_at->timestamp,
                        'user_name' => $enrollment->name,
                        'user_initials' => $this->getInitials($enrollment->name),
                        'action' => 'registered for',
                        'target' => $enrollment->course_title . ' course',
                        'time' => \Carbon\Carbon::parse($enrollment->created_at)->diffForHumans(),
                        'type' => 'Course',
                    ];
                });
        }
    } catch (\Exception $e) {
        // Table doesn't exist or other error, skip enrollments
        $recentEnrollments = collect([]);
    }

    // Combine and sort by time (newest first)
    $allActivities = collect([...$recentBookings, ...$recentOrders, ...$recentEnrollments])
        ->sortByDesc(function($activity) {
            // Parse the "time" string to sort properly
            return $activity['time'];
        })
        ->take(5)
        ->values();

    return $allActivities;
}
}