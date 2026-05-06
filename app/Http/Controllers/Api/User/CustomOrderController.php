<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class CustomOrderController extends Controller
{
    /**
     * Display a listing of the user's custom orders.
     */
    public function index()
    {
        try {
            $user = Auth::user();

            $orders = CustomOrder::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Get stats for each status
            $stats = [
                'pending' => CustomOrder::where('user_id', $user->id)->where('status', 'pending')->count(),
                'in_progress' => CustomOrder::where('user_id', $user->id)->where('status', 'in_progress')->count(),
                'completed' => CustomOrder::where('user_id', $user->id)->where('status', 'completed')->count(),
                'rejected' => CustomOrder::where('user_id', $user->id)->where('status', 'rejected')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $orders,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch custom orders'
            ], 500);
        }
    }

    /**
     * Store a newly created custom order.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'quantity' => 'required|integer|min:1',
                'material' => 'nullable|string|max:255',
                'design_image' => 'nullable|image|max:5120', // 5MB max
            ]);

            $user = Auth::user();

            // Handle image upload
            $designImagePath = null;
            if ($request->hasFile('design_image')) {
                $designImagePath = $request->file('design_image')->store('custom_orders', 'public');
            }

            // Create the order
            $order = CustomOrder::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'quantity' => $validated['quantity'],
                'material' => $validated['material'] ?? null,
                'design_image' => $designImagePath,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Custom order submitted successfully! Our team will review it within 24-48 hours.',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
    return response()->json([
        'success' => false,
        'message' => 'Failed to submit custom order: ' . $e->getMessage(),
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], 500);
}
    }

    /**
     * Display the specified custom order.
     */
    public function show($id)
    {
        try {
            $user = Auth::user();

            $order = CustomOrder::where('user_id', $user->id)->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
    }
}