<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = CustomOrder::where('user_id', $user->id)
            ->with('assignedUser');

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders,  // Returns { success: true, data: [...] }
        ]);
    }

    /**
     * Get single custom order details
     */
    public function show($id)
    {
        $user = Auth::user();
        $order = CustomOrder::where('user_id', $user->id)->findOrFail($id);

        $order->load('assignedUser');

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * ✅ UPDATED: Create new custom order with multiple design images
     */
    public function store(Request $request)
{
    $user = Auth::user();

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'quantity' => 'required|integer|min:1',
        'design_images.*' => 'required|image|max:5120',
    ]);

    // ✅ ADD THIS DEBUG CODE:
    \Log::info('Files received:', [
        'has_files' => $request->hasFile('design_images'),
        'file_count' => $request->hasFile('design_images') ? count($request->file('design_images')) : 0,
        'all_input' => $request->all(),
    ]);

    // Generate unique order number
    $orderNumber = 'CO-' . date('Y') . '-' . strtoupper(Str::random(6));

    // Handle multiple image uploads
    $imagePaths = [];
    if ($request->hasFile('design_images')) {
        foreach ($request->file('design_images') as $file) {
            $path = $file->store('custom-orders', 'public');
            $imagePaths[] = $path;
        }
    }

 

        $validated['user_id'] = $user->id;
        $validated['order_number'] = $orderNumber;
        $validated['status'] = 'pending'; // Initial status
        // ✅ Store image paths as JSON array
        $validated['design_images'] = $imagePaths; // Let Laravel's cast handle JSON

        $order = CustomOrder::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Custom order submitted successfully!',
            'data' => $order,
        ], 201);
    }

    /**
     * ✅ NEW: Upload payment screenshot
     */
    public function uploadPayment(Request $request, $id)
    {
        $user = Auth::user();
        $order = CustomOrder::where('user_id', $user->id)->findOrFail($id);

        // Validate order can accept payment
        if (!$order->estimated_price) {
            return response()->json([
                'success' => false,
                'message' => 'Price not set yet. Please wait for admin to update the price.',
            ], 422);
        }

        if ($order->payment_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Payment already verified. No need to upload again.',
            ], 422);
        }

        $validated = $request->validate([
            'payment_screenshot' => 'required|image|max:5120', // 5MB max
        ]);

        // Delete old screenshot if exists
        if ($order->payment_screenshot) {
            Storage::disk('public')->delete($order->payment_screenshot);
        }

        // Upload new screenshot
        $validated['payment_screenshot'] = $request->file('payment_screenshot')->store('custom-orders-payment', 'public');
        $validated['status'] = 'pending'; // Reset to pending for admin review

        $order->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment screenshot uploaded successfully! Admin will verify shortly.',
            'data' => $order,
        ]);
    }

    /**
     * ✅ NEW: Cancel order (only before payment is verified)
     */
    public function cancel(Request $request, $id)
    {
        $user = Auth::user();
        $order = CustomOrder::where('user_id', $user->id)->findOrFail($id);

        // Check if order can be cancelled
        if ($order->payment_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel order after payment is verified. Please contact support.',
            ], 422);
        }

        if ($order->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel completed order.',
            ], 422);
        }

        $order->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully!',
            'data' => $order,
        ]);
    }

    /**
     * ✅ Get production team members (for display purposes)
     */
    public function getProductionTeam()
    {
        $team = \App\Models\User::whereIn('role', ['production', 'production_team', 'staff'])
            ->select('id', 'name', 'department')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $team,
        ]);
    }
}