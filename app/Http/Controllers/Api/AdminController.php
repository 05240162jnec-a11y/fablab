<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductOrder;
use App\Mail\OrderStatusMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    // get all users
    public function getUsers()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    // update user role
    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:user,admin,super_admin,production_team',
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'User role updated successfully',
            'user'    => $user,
        ]);
    }

    // delete user
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    // get all product orders
    public function getProductOrders()
    {
        $orders = ProductOrder::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    // update product order status
    public function updateProductOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status'     => 'required|string|in:pending,approved,rejected,completed',
            'admin_note' => 'nullable|string',
        ]);

        $order = ProductOrder::with('user')->findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->status;

        // update order status
        $order->status     = $newStatus;
        $order->admin_note = $request->admin_note;

        // set timestamps
        if ($newStatus === 'approved') {
            $order->approved_at = now();

            // reduce stock when approved
            $product = Product::where('name', $order->product_name)->first();
            if ($product && $product->stock >= $order->quantity) {
                $product->stock -= $order->quantity;
                if ($product->stock === 0) {
                    $product->is_available = false;
                }
                $product->save();
            }
        }

        if ($newStatus === 'rejected') {
            $order->rejected_at = now();

            // restore stock if previously approved
            if ($oldStatus === 'approved') {
                $product = Product::where('name', $order->product_name)->first();
                if ($product) {
                    $product->stock += $order->quantity;
                    $product->is_available = true;
                    $product->save();
                }
            }
        }

        $order->save();

        // send email notification to user
        try {
            Mail::to($order->user->email)->send(
                new OrderStatusMail($order, $newStatus, $request->admin_note)
            );
        } catch (\Exception $e) {
            // log error but don't fail the request
            \Log::error('Failed to send email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Order status updated and email sent to user',
            'order'   => $order,
        ]);
    }

   // get dashboard stats
    public function getStats()
    {
        $stats = [
            'total_users'         => User::count(),
            'total_orders'        => ProductOrder::count(),
            'pending_orders'      => ProductOrder::where('status', 'pending')->count(),
            'completed_orders'    => ProductOrder::where('status', 'completed')->count(),
            'total_machines'      => \App\Models\Machine::count(),
            'available_machines'  => \App\Models\Machine::where('status', 'available')->count(),
            'total_bookings'      => \App\Models\MachineBooking::count(),
            'pending_bookings'    => \App\Models\MachineBooking::where('status', 'pending')->count(),
            'total_courses'       => \App\Models\Course::count(),
            'total_enrollments'   => \App\Models\CourseEnrollment::count(),
            'pending_enrollments' => \App\Models\CourseEnrollment::where('status', 'enrolled')->count(),
        ];

        return response()->json($stats);
    }
    
}