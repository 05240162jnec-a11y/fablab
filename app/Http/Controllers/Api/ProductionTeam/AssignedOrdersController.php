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
                'user_name' => $order->user->name ?? 'Unknown Customer', // Requires $order->user relation in model
                'description' => $order->description,
                'status' => $order->status, // e.g., 'assigned', 'in_progress', 'completed'
                'deadline' => $order->deadline ? $order->deadline->format('Y-m-d') : null,
                'design_image' => $order->design_image ?? null,  // ✅ Matches your model
                'created_at' => $order->created_at->format('M d, Y'),
            ];
        });

        return response()->json(['orders' => $formatted]);
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