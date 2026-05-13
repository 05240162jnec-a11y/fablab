<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\ProductOrder;
use App\Models\CustomOrder;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function index()
    {
        // ✅ Total Users (excluding admins)
        $totalUsers = User::where('role', '!=', 'admin')->count();

        // ✅ Active Bookings (pending + confirmed)
        $activeBookings = Booking::whereIn('status', ['pending', 'confirmed'])->count();

        // ✅ Ongoing Courses (active courses)
        $ongoingCourses = Course::where('status', 'open')->count();

        // ✅ Pending Orders (product orders + custom orders)
        $pendingProductOrders = ProductOrder::where('status', 'pending')->count();
        $pendingCustomOrders = CustomOrder::where('status', 'pending')->count();
        $pendingOrders = $pendingProductOrders + $pendingCustomOrders;

        // ✅ Recent Activity (latest bookings)
        $recentActivity = Booking::with(['user', 'machine'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'booking',
                    'action' => 'New booking for ' . ($booking->machine->name ?? 'Machine'),
                    'user' => $booking->user->name ?? 'Unknown User',
                    'status' => ucfirst($booking->status),
                    'date' => $booking->created_at->format('M j, Y'),
                ];
            });

        // ✅ Recent Orders
        $recentOrders = ProductOrder::with('user')
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'type' => 'order',
                    'action' => 'New product order',
                    'user' => $order->user->name ?? 'Unknown User',
                    'status' => ucfirst($order->status),
                    'date' => $order->created_at->format('M j, Y'),
                ];
            });

        // Combine recent activity
        $allActivity = $recentActivity->concat($recentOrders)
            ->sortByDesc('date')
            ->values();

        return response()->json([
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeBookings' => $activeBookings,
                'ongoingCourses' => $ongoingCourses,
                'pendingOrders' => $pendingOrders,
            ],
            'recentActivity' => $allActivity,
        ]);
    }
}