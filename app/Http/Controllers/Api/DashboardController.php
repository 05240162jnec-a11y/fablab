<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\ProductOrder;
use App\Models\CustomOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
            'announcements' => [],
            'courses' => $courses,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * ✅ Get user's booking activity (Top 5 machines)
     */
    public function getBookingActivity()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $bookingActivity = Booking::where('user_id', $user->id)
            ->select('machine_id', DB::raw('count(*) as booking_count'))
            ->groupBy('machine_id')
            ->orderByDesc('booking_count')
            ->limit(5)
            ->with('machine:id,name')
            ->get()
            ->map(function ($booking) {
                return [
                    'machine_name' => $booking->machine->name ?? 'Unknown Machine',
                    'booking_count' => $booking->booking_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $bookingActivity,
        ]);
    }

    /**
     * ✅ Get user's monthly spending trend (Last 6 months)
     */
    public function getMonthlySpending()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $months = [];
        $currentDate = Carbon::now();

        for ($i = 5; $i >= 0; $i--) {
            $month = $currentDate->copy()->subMonths($i);
            $monthKey = $month->format('Y-m');
            $monthLabel = $month->format('M Y');
            
            $months[$monthKey] = [
                'month' => $monthLabel,
                'product_revenue' => 0,
                'custom_revenue' => 0,
            ];
        }

        // ✅ Get Product Orders spending by month
        $productOrders = ProductOrder::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get();

        foreach ($productOrders as $order) {
            $monthKey = $order->created_at->format('Y-m');
            if (isset($months[$monthKey])) {
                $months[$monthKey]['product_revenue'] += (float) $order->total_amount;
            }
        }

        // ✅ Get Custom Orders spending by month
        $customOrders = CustomOrder::where('user_id', $user->id)
            ->whereIn('status', ['approved', 'completed', 'in_progress'])
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get();

        foreach ($customOrders as $order) {
            $monthKey = $order->created_at->format('Y-m');
            if (isset($months[$monthKey])) {
                $months[$monthKey]['custom_revenue'] += (float) $order->estimated_price;
            }
        }

        $monthlyData = array_values($months);

        return response()->json([
            'success' => true,
            'data' => $monthlyData,
        ]);
    }

        /**
     * ✅ Get top 5 selling products (GLOBAL - all users)
     */
    public function getTopProducts()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        // ✅ Get ALL approved product orders (from ALL users)
        $orders = ProductOrder::where('status', 'approved')
            ->get();

        // Aggregate product data across all users
        $productStats = [];

        foreach ($orders as $order) {
            if (!empty($order->items)) {
                foreach ($order->items as $item) {
                    // ✅ FIXED: Check for both "id" and "product_id" field names
                    $productId = $item['id'] ?? $item['product_id'] ?? null;
                    $productName = $item['name'] ?? $item['product_name'] ?? 'Unknown Product';
                    $quantity = (int) ($item['quantity'] ?? 1);
                    $price = (float) ($item['price'] ?? $item['unit_price'] ?? 0);

                    if ($productId) {
                        if (!isset($productStats[$productId])) {
                            $productStats[$productId] = [
                                'product_id' => $productId,
                                'name' => $productName,
                                'total_quantity' => 0,
                                'total_revenue' => 0,
                            ];
                        }

                        $productStats[$productId]['total_quantity'] += $quantity;
                        $productStats[$productId]['total_revenue'] += ($quantity * $price);
                    }
                }
            }
        }

        // Sort by quantity and get top 5
        $topProducts = collect($productStats)
            ->sortByDesc('total_quantity')
            ->take(5)
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $topProducts,
        ]);
    }
}