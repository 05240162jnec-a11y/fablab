<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Course;
use App\Models\ProductOrder;
use App\Models\CustomOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function index()
    {
        try {
            $totalUsers = User::where('role', '!=', 'admin')->count();
            $activeBookings = Booking::whereIn('status', ['pending', 'confirmed'])->count();
            $ongoingCourses = Course::where('status', 'open')->count();
            $pendingProductOrders = ProductOrder::where('status', 'pending')->count();
            $pendingCustomOrders = CustomOrder::where('status', 'pending')->count();
            $pendingOrders = $pendingProductOrders + $pendingCustomOrders;

            return response()->json([
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'activeBookings' => $activeBookings,
                    'ongoingCourses' => $ongoingCourses,
                    'pendingOrders' => $pendingOrders,
                ],
                'recentActivity' => [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'stats' => [
                    'totalUsers' => 0,
                    'activeBookings' => 0,
                    'ongoingCourses' => 0,
                    'pendingOrders' => 0,
                ],
                'recentActivity' => [],
            ]);
        }
    }

    /**
     * Get user distribution by role
     */
    public function getUserDistribution()
    {
        try {
            $userDistribution = User::select('role', DB::raw('count(*) as count'))
                ->where('role', '!=', 'admin')
                ->groupBy('role')
                ->get()
                ->map(function ($item) {
                    return [
                        'role' => ucfirst(str_replace('_', ' ', $item->role)),
                        'count' => $item->count,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $userDistribution,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => [],
            ]);
        }
    }

    /**
     * Get top selling products this month
     */
    public function getTopSellingProducts()
    {
        try {
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            $orders = ProductOrder::where('status', 'approved')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->get();

            $productStats = [];

            foreach ($orders as $order) {
                $items = $order->items;
                
                if (is_string($items)) {
                    $items = json_decode($items, true);
                }

                if (is_array($items)) {
                    foreach ($items as $item) {
                        $name = $item['name'] ?? 'Unknown Product';
                        $quantity = $item['quantity'] ?? 1;
                        $price = $item['price'] ?? 0;

                        if (!isset($productStats[$name])) {
                            $productStats[$name] = [
                                'name' => $name,
                                'total_quantity' => 0,
                                'total_revenue' => 0,
                            ];
                        }
                        $productStats[$name]['total_quantity'] += $quantity;
                        $productStats[$name]['total_revenue'] += ($price * $quantity);
                    }
                }
            }

            $sorted = collect($productStats)
                ->sortByDesc('total_quantity')
                ->take(10)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $sorted,
            ]);
        } catch (\Exception $e) {
            \Log::error('Top products error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [],
            ]);
        }
    }

    /**
     * Get monthly revenue trends
     */
    public function getMonthlyRevenue()
    {
        try {
            $last6Months = [];
            
            for ($i = 5; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $startOfMonth = $month->copy()->startOfMonth();
                $endOfMonth = $month->copy()->endOfMonth();

                // Product orders revenue
                $productRevenue = ProductOrder::where('status', 'approved')
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->sum('total_amount');

                // Custom orders revenue - handle different column names
                $customRevenue = 0;
                try {
                    $customOrders = CustomOrder::where('status', 'completed')
                        ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                        ->get();
                    
                    foreach ($customOrders as $order) {
                        if (isset($order->total_amount)) {
                            $customRevenue += $order->total_amount;
                        } elseif (isset($order->quoted_price)) {
                            $customRevenue += $order->quoted_price;
                        } elseif (isset($order->final_price)) {
                            $customRevenue += $order->final_price;
                        } elseif (isset($order->amount)) {
                            $customRevenue += $order->amount;
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore custom order errors
                    $customRevenue = 0;
                }

                $last6Months[] = [
                    'month' => $month->format('M Y'),
                    'product_revenue' => (float) $productRevenue,
                    'custom_revenue' => (float) $customRevenue,
                    'total_revenue' => (float) ($productRevenue + $customRevenue),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $last6Months,
            ]);
        } catch (\Exception $e) {
            \Log::error('Monthly revenue error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [],
            ]);
        }
    }

    /**
     * Get most booked machines
     */
    public function getMostBookedMachines()
    {
        try {
            $mostBooked = Booking::select('machine_id', DB::raw('count(*) as booking_count'))
                ->with('machine:id,name')
                ->groupBy('machine_id')
                ->orderByDesc('booking_count')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'machine_id' => $item->machine_id,
                        'machine_name' => $item->machine->name ?? 'Unknown Machine',
                        'booking_count' => $item->booking_count,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $mostBooked,
            ]);
        } catch (\Exception $e) {
            \Log::error('Most booked machines error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [],
            ]);
        }
    }
}