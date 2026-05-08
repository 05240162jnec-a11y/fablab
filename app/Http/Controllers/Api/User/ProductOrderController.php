<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\ProductOrder;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductOrderController extends Controller
{
    /**
     * Display user's product orders.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $orders = ProductOrder::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    /**
     * Store a new product order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'delivery_option' => 'required|in:pickup,shipping',
            'shipping_address' => 'required_if:delivery_option,shipping|string',
            'payment_screenshot' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify product stock availability
        foreach ($request->items as $item) {
            $product = Product::find($item['id']);
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found: ' . $item['name']
                ], 404);
            }
            if ($product->stock < $item['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock for: ' . $product->name
                ], 400);
            }
        }

        DB::beginTransaction();

        try {
            // Handle payment screenshot upload
            $screenshotPath = null;
            if ($request->hasFile('payment_screenshot')) {
                $screenshotPath = $request->file('payment_screenshot')->store('product_orders', 'public');
            }

            // ✅ FIXED: Calculate shipping cost (Fixed Nu. 150 for shipping)
            $shippingCost = $request->delivery_option === 'shipping' ? 150.00 : 0.00;

            // Create the order
            $order = ProductOrder::create([
                'order_number' => ProductOrder::generateOrderNumber(),
                'user_id' => Auth::id(),
                'items' => $request->items,
                'total_amount' => $request->total_amount,
                'shipping_cost' => $shippingCost,
                'delivery_option' => $request->delivery_option,
                'shipping_address' => $request->delivery_option === 'shipping' ? $request->shipping_address : null,
                'payment_screenshot' => $screenshotPath,
                'status' => 'pending',
            ]);

            // Reduce product stock
            foreach ($request->items as $item) {
                $product = Product::find($item['id']);
                $product->decrement('stock', $item['quantity']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order submitted successfully! We will review your payment and confirm shortly.',
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded screenshot if exists
            if ($screenshotPath) {
                Storage::disk('public')->delete($screenshotPath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a specific order.
     */
    public function show($id)
    {
        $user = Auth::user();

        $order = ProductOrder::where('user_id', $user->id)
            ->where('id', $id)
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