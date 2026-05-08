<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductOrder;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductOrderController extends Controller
{
    /**
     * Display all product orders for admin.
     */
    public function index(Request $request)
    {
        $query = ProductOrder::with('user')->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by user name or order number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('order_number', 'like', "%{$search}%");
        }

        $orders = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    /**
     * Display a specific order with details.
     */
    public function show($id)
    {
        $order = ProductOrder::with('user')->findOrFail($id);

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }

    /**
     * Get payment screenshot URL.
     */
    public function screenshot($id)
    {
        $order = ProductOrder::findOrFail($id);

        if (!$order->payment_screenshot) {
            return response()->json([
                'success' => false,
                'message' => 'No screenshot uploaded'
            ], 404);
        }

        $imageUrl = Storage::disk('public')->url($order->payment_screenshot);

        return response()->json([
            'success' => true,
            'image_url' => $imageUrl
        ]);
    }

    /**
     * Approve a product order.
     */
    public function approve(Request $request, $id)
    {
        $order = ProductOrder::findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Order is not pending approval'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Update order status
            $order->update(['status' => 'approved']);

            // Send approval email to user
            $this->sendApprovalEmail($order);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order approved successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a product order.
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = ProductOrder::findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Order is not pending approval'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Update order status and rejection reason
            $order->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason
            ]);

            // Send rejection email to user
            $this->sendRejectionEmail($order, $request->rejection_reason);

            // Restore product stock if needed
            foreach ($order->items as $item) {
                $product = Product::find($item['id']);
                if ($product) {
                    $product->increment('stock', $item['quantity']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order rejected successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send approval email to user.
     */
    private function sendApprovalEmail(ProductOrder $order)
    {
        // For now, log the email - you can integrate with Mail later
        \Log::info('Approval email would be sent to: ' . $order->user->email, [
            'order_number' => $order->order_number,
            'total_amount' => $order->total_amount,
            'delivery_option' => $order->delivery_option,
        ]);

        // TODO: Implement actual email sending with Laravel Mail
        // Mail::to($order->user->email)->send(new OrderApproved($order));
    }

    /**
     * Send rejection email to user.
     */
    private function sendRejectionEmail(ProductOrder $order, string $reason)
    {
        // For now, log the email - you can integrate with Mail later
        \Log::info('Rejection email would be sent to: ' . $order->user->email, [
            'order_number' => $order->order_number,
            'rejection_reason' => $reason,
        ]);

        // TODO: Implement actual email sending with Laravel Mail
        // Mail::to($order->user->email)->send(new OrderRejected($order, $reason));
    }
}