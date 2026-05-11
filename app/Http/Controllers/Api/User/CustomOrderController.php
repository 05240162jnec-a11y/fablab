<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CustomOrderController extends Controller
{
    /**
     * Display user's custom orders.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $orders = CustomOrder::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'pending' => $orders->where('status', 'pending')->count(),
            'in_progress' => $orders->where('status', 'in_progress')->count(),
            'completed' => $orders->where('status', 'completed')->count(),
            'rejected' => $orders->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $orders,
            'stats' => $stats
        ]);
    }

    /**
     * Store a new custom order.
     */
    public function store(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'design_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Handle design image upload
            $imagePath = null;
            if ($request->hasFile('design_image')) {
                $imagePath = $request->file('design_image')->store('custom_orders', 'public');
            }

            // Create the order
            $order = CustomOrder::create([
                'user_id' => Auth::id(),
                'title' => $request->title,
                'description' => $request->description,
                'quantity' => $request->quantity,
                'design_image' => $imagePath,
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Custom order submitted successfully! Our team will review it within 24-48 hours.',
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded image if exists
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit order. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a specific custom order.
     */
    public function show($id)
    {
        $user = Auth::user();

        $order = CustomOrder::where('user_id', $user->id)
            ->where('id', $id)
            ->with(['assignedUser'])
            ->first();

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