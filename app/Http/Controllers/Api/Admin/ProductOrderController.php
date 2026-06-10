<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductOrder;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Notifications\ProductOrderStatusNotification;

class ProductOrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $orders = ProductOrder::with('user')->orderBy('created_at', 'desc')->get();
            return response()->json(['success' => true, 'data' => $orders]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $order = ProductOrder::with('user')->findOrFail($id);
        return response()->json(['success' => true, 'order' => $order]);
    }

    public function screenshot($id)
    {
        $order = ProductOrder::findOrFail($id);
        if (!$order->payment_screenshot) {
            return response()->json(['success' => false, 'message' => 'No screenshot'], 404);
        }
        $url = Storage::disk('public')->url($order->payment_screenshot);
        return response()->json(['success' => true, 'image_url' => $url]);
    }

    public function approve(Request $request, $id)
    {
        try {
            $order = ProductOrder::findOrFail($id);

            if ($order->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Not pending'], 400);
            }

            $order->update(['status' => 'approved']);

            // Notify user
            $order->load('user');
            if ($order->user) {
                $order->user->notify(new ProductOrderStatusNotification($order, 'approved'));
            }

            // Send email
            try {
                if ($order->user && $order->user->email) {
                    \Illuminate\Support\Facades\Mail::to($order->user->email)
                        ->send(new \App\Mail\OrderApprovedMail($order));
                }
            } catch (\Exception $e) {
                \Log::error('Email failed: ' . $e->getMessage());
            }

            return response()->json(['success' => true, 'message' => 'Approved', 'order' => $order]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to approve: ' . $e->getMessage()], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        try {
            $order = ProductOrder::findOrFail($id);

            if ($order->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Not pending'], 400);
            }

            $request->validate(['rejection_reason' => 'required|string|min:10']);

            $order->update([
                'status'               => 'rejected',
                'rejection_reason'     => $request->rejection_reason,
                'payment_rejected_at'  => now(),
                'rejection_deadline'   => now()->addHours(Setting::getPaymentUploadDeadlineHours()),
                'permanently_rejected' => false,
            ]);

            // Notify user
            $order->load('user');
            if ($order->user) {
                $order->user->notify(new ProductOrderStatusNotification($order, 'rejected', $request->rejection_reason));
            }

            // Send rejection email
            try {
                if ($order->user && $order->user->email) {
                    \Illuminate\Support\Facades\Mail::to($order->user->email)
                        ->send(new \App\Mail\OrderRejectedMail($order, $request->rejection_reason));
                }
            } catch (\Exception $e) {
                \Log::error('Rejection email failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Rejected. User has 24 hours to re-upload payment.',
                'order'   => $order
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to reject: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $order = ProductOrder::findOrFail($id);
        if ($order->payment_screenshot) {
            Storage::disk('public')->delete($order->payment_screenshot);
        }
        $order->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }
}