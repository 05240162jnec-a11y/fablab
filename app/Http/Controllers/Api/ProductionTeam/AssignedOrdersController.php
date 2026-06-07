<?php

namespace App\Http\Controllers\Api\ProductionTeam;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssignedOrdersController extends Controller
{
    /**
 * Get all custom orders assigned to the logged-in production team member
 */
public function index()
{
    $user = Auth::user();

    // 🔍 Fetch orders assigned to this specific production team user
    $orders = CustomOrder::where('assigned_to', $user->id)
        ->orderBy('deadline', 'asc')
        ->get();

    // 📦 Format response for frontend
    $formatted = $orders->map(function ($order) {
        return [
            'id' => $order->id,
            'user_name' => $order->user->name ?? 'Unknown Customer',
            'description' => $order->description,
            'status' => $order->status,
            'deadline' => $order->deadline ? $order->deadline->format('Y-m-d') : null,
            'design_image' => $order->design_image,
            'design_images' => $order->design_images ?? [],  // ✅ Already an array from model cast!
            'created_at' => $order->created_at->format('M d, Y'),
        ];
    });

    return response()->json(['orders' => $formatted]);
}

/**
 * Get ALL custom orders (read-only view for production team)
 */
public function getAllCustomOrders()
{
    // ✅ Fetch all custom orders with relationships
    $orders = CustomOrder::with(['user', 'assignedUser'])
        ->orderBy('created_at', 'desc')
        ->get();

    // 📦 Format response for frontend
    $formatted = $orders->map(function ($order) {
        return [
            'id' => $order->id,
            'order_number' => $order->id,
            'title' => $order->title ?? 'Untitled Order',
            'description' => $order->description,
            'quantity' => $order->quantity,
            'design_image' => $order->design_image,
            'design_images' => $order->design_images ?? [],  // ✅ Already an array from model cast!
            'status' => $order->status,
            'estimated_price' => $order->estimated_price,
            'user' => [
                'id' => $order->user->id ?? null,
                'name' => $order->user->name ?? 'Unknown User',
                'email' => $order->user->email ?? null,
            ],
            'assigned_to' => $order->assigned_to,
            'assigned_user' => $order->assignedUser ? [
                'id' => $order->assignedUser->id,
                'name' => $order->assignedUser->name,
            ] : null,
            'created_at' => $order->created_at->format('M d, Y'),
            'updated_at' => $order->updated_at->format('M d, Y'),
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $formatted,
        'total' => $formatted->count(),
    ]);
}

    /**
     * Update order status (assigned -> in_progress -> completed)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:in_progress,completed'
        ]);

        $user = Auth::user();
        
        // 🔒 Security: Only allow updating orders assigned to THIS user
        $order = CustomOrder::where('id', $id)
            ->where('assigned_to', $user->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found or not assigned to you.'], 404);
        }

        // Update status
        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => ['id' => $order->id, 'status' => $order->status]
        ]);
    }
}