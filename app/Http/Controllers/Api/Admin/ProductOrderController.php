<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductOrderController extends Controller
{
    // Get all product orders with filters
    public function index(Request $request)
    {
        $query = ProductOrder::with('user:id,name,email');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by user name or order name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    // Approve order
    public function approve($id)
    {
        $order = ProductOrder::findOrFail($id);
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

        $order = ProductOrder::findOrFail($id);
        $order->status = 'rejected';
        $order->rejection_reason = $validated['rejection_reason'];
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order rejected successfully',
            'data' => $order
        ]);
    }

    // Get order screenshot
    public function screenshot($id)
    {
        $order = ProductOrder::findOrFail($id);
        
        if (!$order->image) {
            return response()->json(['success' => false, 'message' => 'No screenshot available'], 404);
        }

        return response()->json([
            'success' => true,
            'image_url' => asset('storage/' . $order->image)
        ]);
    }
}