<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomOrderController extends Controller
{
    /**
     * Display all custom orders (Admin).
     */
    public function index(Request $request)
    {
        $query = CustomOrder::with(['user', 'assignedUser']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by assigned user
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // Calculate stats
        $stats = [
            'pending' => CustomOrder::where('status', 'pending')->count(),
            'in_progress' => CustomOrder::where('status', 'in_progress')->count(),
            'completed' => CustomOrder::where('status', 'completed')->count(),
            'rejected' => CustomOrder::where('status', 'rejected')->count(),
            'unassigned' => CustomOrder::whereNull('assigned_to')->where('status', '!=', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $orders,
            'stats' => $stats
        ]);
    }

    /**
     * Get production team members for assignment dropdown.
     */
    public function getProductionTeam()
    {
        // Get users with production_team role
        $productionTeam = User::where('role', 'production_team')
            ->select('id', 'name', 'email')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $productionTeam
        ]);
    }

    /**
     * Assign order to production team member.
     */
    public function assign(Request $request, $id)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'assigned_to' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = CustomOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $order->update([
            'assigned_to' => $request->assigned_to,
            'assigned_at' => now(),
            'status' => 'in_progress',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order assigned successfully',
            'order' => $order
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed,rejected',
            'rejection_reason' => 'required_if:status,rejected|string',
            'estimated_price' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = CustomOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $updateData = [
            'status' => $request->status,
        ];

        if ($request->has('estimated_price')) {
            $updateData['estimated_price'] = $request->estimated_price;
        }

        if ($request->status === 'rejected' && $request->has('rejection_reason')) {
            $updateData['rejection_reason'] = $request->rejection_reason;
        }

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    /**
     * Get orders assigned to current production team member.
     */
    public function myAssignedOrders(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::user();

        $orders = CustomOrder::where('assigned_to', $user->id)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Show a specific order (Admin).
     */
    public function show($id)
    {
        $order = CustomOrder::with(['user', 'assignedUser'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }
}