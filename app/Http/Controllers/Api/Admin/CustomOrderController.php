<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\User;
use App\Mail\CustomOrderPriceUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CustomOrderPriceUpdatedNotification;

class CustomOrderController extends Controller
{
    /**
     * Get all custom orders for admin (Excludes Cancelled)
     */
    public function index(Request $request)
    {
        $query = CustomOrder::with(['user', 'assignedUser']);

        // ✅ Hide Cancelled orders from admin view
        $query->where('status', '!=', 'cancelled');

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
     * ✅ UPDATED: Update estimated price and breakdown
     */
    public function updatePrice(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'estimated_price' => 'required|numeric|min:0',
            'price_breakdown' => 'nullable|string', // ✅ New field
        ]);

        $order->update([
            'estimated_price' => $validated['estimated_price'],
            'price_breakdown' => $validated['price_breakdown'] ?? null, // ✅ Save breakdown
            'status' => 'pending', 
            'rejection_reason' => null, 
        ]);

        try {
            Mail::to($order->user->email)->send(new CustomOrderPriceUpdated($order, $order->user));
        } catch (\Exception $e) {
            \Log::error('Failed to send price update email: ' . $e->getMessage());
        }
        // ✅ Notify the user about the price update (in-app notification)
        $order->user->notify(new CustomOrderPriceUpdatedNotification($order));

        return response()->json([
            'success' => true,
            'message' => 'Price updated successfully! User has been notified via email.',
            'data' => $order,
        ]);
    }

    /**
     * Verify payment screenshot uploaded by user
     */
    public function verifyPayment(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'rejection_reason' => 'nullable|string|required_if:action,reject',
        ]);

        if ($validated['action'] === 'approve') {
            $order->update([
                'payment_verified_at' => now(),
                'status' => 'in_progress',
                'rejection_reason' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified! Order status updated to In Progress.',
                'data' => $order,
            ]);
        } else {
            $order->update([
                'payment_verified_at' => null,
                'rejection_reason' => $validated['rejection_reason'] ?? 'Payment could not be verified. Please re-upload.',
                'status' => 'payment_rejected', 
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment rejected. User will be notified to re-upload.',
                'data' => $order,
            ]);
        }
    }

    /**
     * Assign order to production team member
     */
    public function assign(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $assignee = User::find($validated['assigned_to']);
        if ($assignee && $assignee->role !== 'production_team') {
            return response()->json([
                'success' => false,
                'message' => 'Can only assign to production team members.',
            ], 422);
        }

        if (!$order->payment_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Order can only be assigned after payment is verified.',
            ], 422);
        }

        $order->update([
            'assigned_to' => $validated['assigned_to'],
            'assigned_at' => now(),
            'status' => 'in_progress', 
        ]);

        $order->load('assignedUser');

        return response()->json([
            'success' => true,
            'message' => 'Order assigned successfully!',
            'data' => $order,
        ]);
    }

    /**
     * Get available production team members for dropdown
     */
    public function getProductionTeam()
    {
        $team = User::where('role', 'production_team')
            ->select('id', 'name', 'email')
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

        if ($order->design_images && is_array($order->design_images)) {
            foreach ($order->design_images as $imagePath) {
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        if ($order->design_image) {
            if (Storage::disk('public')->exists($order->design_image)) {
                Storage::disk('public')->delete($order->design_image);
            }
        }

        if ($order->payment_screenshot) {
            if (Storage::disk('public')->exists($order->payment_screenshot)) {
                Storage::disk('public')->delete($order->payment_screenshot);
            }
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully',
        ]);
    }

    /**
     * Reject design
     */
    public function rejectDesign(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10',
        ]);

        $order->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Design rejected. User will be notified to resubmit.',
            'data' => $order,
        ]);
    }

    /**
     * Bulk delete custom orders
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|exists:custom_orders,id',
        ]);

        $deletedCount = 0;
        
        foreach ($validated['order_ids'] as $orderId) {
            $order = CustomOrder::find($orderId);
            
            if ($order) {
                if ($order->design_images && is_array($order->design_images)) {
                    foreach ($order->design_images as $imagePath) {
                        if (Storage::disk('public')->exists($imagePath)) {
                            Storage::disk('public')->delete($imagePath);
                        }
                    }
                }
                
                if ($order->design_image) {
                    if (Storage::disk('public')->exists($order->design_image)) {
                        Storage::disk('public')->delete($order->design_image);
                    }
                }
                
                if ($order->payment_screenshot) {
                    if (Storage::disk('public')->exists($order->payment_screenshot)) {
                        Storage::disk('public')->delete($order->payment_screenshot);
                    }
                }
                
                $order->delete();
                $deletedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => $deletedCount . ' order(s) deleted successfully',
            'deleted_count' => $deletedCount,
        ]);
    }
}