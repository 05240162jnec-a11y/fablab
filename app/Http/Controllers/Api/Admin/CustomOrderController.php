<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomOrderController extends Controller
{
    // Get all orders with optional filters
    public function index(Request $request)
    {
        $query = CustomOrder::with('user:id,name,email');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by title or order number
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('order_number', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->get();

        // Calculate stats
        $stats = [
            'pending' => CustomOrder::where('status', 'pending')->count(),
            'approved' => CustomOrder::where('status', 'approved')->count(),
            'rejected' => CustomOrder::where('status', 'rejected')->count(),
            'total' => CustomOrder::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $orders,
            'stats' => $stats
        ]);
    }

    // Get single order
    public function show($id)
    {
        $order = CustomOrder::with('user:id,name,email,phone')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    // Approve order
    public function approve($id)
    {
        $order = CustomOrder::findOrFail($id);
        $order->status = 'approved';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order approved successfully',
            'data' => $order
        ]);
    }

    // Reject order with reason
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $order = CustomOrder::findOrFail($id);
        $order->status = 'rejected';
        $order->rejection_reason = $validated['rejection_reason'];
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order rejected successfully',
            'data' => $order
        ]);
    }

    // Delete order
    public function destroy($id)
    {
        $order = CustomOrder::findOrFail($id);

        // Delete image if exists
        if ($order->image) {
            Storage::disk('public')->delete($order->image);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }
}