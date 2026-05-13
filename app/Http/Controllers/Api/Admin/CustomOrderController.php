<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\User;
use App\Models\ProductionTeam;
use App\Mail\CustomOrderPriceUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomOrderController extends Controller
{
    /**
     * Get all custom orders for admin
     */
    public function index(Request $request)
    {
        $query = CustomOrder::with(['user', 'assignedUser']);

        // Search by title or order number
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('order_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get single custom order details
     */
    public function show($id)
    {
        $order = CustomOrder::with(['user', 'assignedUser'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * ✅ NEW: Update estimated price and notify user via email
     */
    public function updatePrice(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        // Validate price
        $validated = $request->validate([
            'estimated_price' => 'required|numeric|min:0',
        ]);

        // Update the order
        $order->update([
            'estimated_price' => $validated['estimated_price'],
            'status' => 'pending', // Reset to pending so user can pay
        ]);

        // ✅ Send email notification to user
        try {
            Mail::to($order->user->email)->send(new CustomOrderPriceUpdated($order, $order->user));
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to send price update email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Price updated successfully! User has been notified via email.',
            'data' => $order,
        ]);
    }

    /**
     * ✅ NEW: Verify payment screenshot uploaded by user
     */
    public function verifyPayment(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'rejection_reason' => 'nullable|string|required_if:action,reject',
        ]);

        if ($validated['action'] === 'approve') {
            // ✅ Approve payment - mark as verified and set status to in_progress
            $order->update([
                'payment_verified_at' => now(),
                'status' => 'in_progress',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified! Order status updated to In Progress.',
                'data' => $order,
            ]);
        } else {
            // ❌ Reject payment - ask user to re-upload
            $order->update([
                'payment_verified_at' => null,
                'rejection_reason' => $validated['rejection_reason'] ?? 'Payment could not be verified. Please re-upload.',
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment rejected. User will be notified to re-upload.',
                'data' => $order,
            ]);
        }
    }

    /**
     * ✅ NEW: Assign order to production team member
     */
    public function assign(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id', // Assuming production team are users with role 'production'
        ]);

        // Only allow assignment if payment is verified and status is in_progress
        if (!$order->payment_verified_at || $order->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Order can only be assigned after payment is verified.',
            ], 422);
        }

        $order->update([
            'assigned_to' => $validated['assigned_to'],
            'assigned_at' => now(),
        ]);

        // Load the assigned user for response
        $order->load('assignedUser');

        return response()->json([
            'success' => true,
            'message' => 'Order assigned successfully!',
            'data' => $order,
        ]);
    }

    /**
     * ✅ Get available production team members for dropdown
     */
    public function getProductionTeam()
    {
        // Assuming production team members are users with role 'production' or 'production_team'
        $team = User::whereIn('role', ['production', 'production_team', 'staff'])
            ->select('id', 'name', 'email', 'department')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $team,
        ]);
    }

    /**
     * Update order status (reject, complete, etc.)
     */
    public function updateStatus(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,rejected',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);

        $order->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully!',
            'data' => $order,
        ]);
    }

    /**
     * Delete custom order
     */
    public function destroy($id)
    {
        $order = CustomOrder::findOrFail($id);

        // Delete design image if exists
        if ($order->design_image) {
            Storage::disk('public')->delete($order->design_image);
        }

        // Delete payment screenshot if exists
        if ($order->payment_screenshot) {
            Storage::disk('public')->delete($order->payment_screenshot);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully',
        ]);
    }
}