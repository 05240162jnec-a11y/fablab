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
use App\Models\User;
use App\Notifications\NewProductOrderNotification;
use App\Notifications\ProductOrderPaymentUploadedNotification;

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

        // Enrich items with product images
        $orders = $orders->map(function($order) {
            $itemsWithImages = [];
            
            foreach ($order->items as $item) {
                $product = Product::find($item['id']);
                
                // Safely get images
                $productImage = null;
                $productImages = [];
                
                if ($product) {
                    // Check if images is an array or JSON string
                    if (is_string($product->images)) {
                        $imagesArray = json_decode($product->images, true) ?? [];
                    } else if (is_array($product->images)) {
                        $imagesArray = $product->images;
                    } else {
                        $imagesArray = [];
                    }
                    
                    $productImage = !empty($imagesArray) ? $imagesArray[0] : null;
                    $productImages = $imagesArray;
                }
                
                $itemsWithImages[] = array_merge($item, [
                    'image' => $productImage,
                    'images' => $productImages,
                ]);
            }
            
            $order->items = $itemsWithImages;
            return $order;
        });

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

            // Calculate shipping cost (Fixed Nu. 150 for shipping)
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

            // Notify admin
            $admin = User::where('role', 'admin')->first();
            if ($admin) $admin->notify(new NewProductOrderNotification($order->load('user')));

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

        // Also enrich items with images for single order view
        $itemsWithImages = [];
        foreach ($order->items as $item) {
            $product = Product::find($item['id']);
            
            // Safely get images
            $productImage = null;
            $productImages = [];
            
            if ($product) {
                if (is_string($product->images)) {
                    $imagesArray = json_decode($product->images, true) ?? [];
                } else if (is_array($product->images)) {
                    $imagesArray = $product->images;
                } else {
                    $imagesArray = [];
                }
                
                $productImage = !empty($imagesArray) ? $imagesArray[0] : null;
                $productImages = $imagesArray;
            }
            
            $itemsWithImages[] = array_merge($item, [
                'image' => $productImage,
                'images' => $productImages,
            ]);
        }
        $order->items = $itemsWithImages;

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }

    /**
     * ✅ NEW: Upload payment screenshot for rejected orders (re-upload)
     */
    public function uploadPayment(Request $request, $id)
    {
        try {
            $order = ProductOrder::findOrFail($id);
            
            // Check if order belongs to authenticated user
            if ($order->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // Check if order is rejected and can accept re-upload
            if ($order->status !== 'rejected') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment can only be uploaded for rejected orders'
                ], 400);
            }
            
            // Check if deadline has passed
            if ($order->rejection_deadline && $order->rejection_deadline < now()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rejection deadline has passed. Please place a new order.'
                ], 400);
            }
            
            // Validate file
            $request->validate([
                'payment_screenshot' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ]);
            
            // Store the screenshot
            if ($request->hasFile('payment_screenshot')) {
                // Delete old screenshot if exists
                if ($order->payment_screenshot) {
                    Storage::disk('public')->delete($order->payment_screenshot);
                }
                
                $file = $request->file('payment_screenshot');
                $path = $file->store('product_orders', 'public');
                
                $order->update([
                    'payment_screenshot' => $path,
                    'status' => 'pending', // Reset to pending for re-verification
                    'payment_rejected_at' => null,
                    'rejection_deadline' => null,
                    'delivery_option' => $request->delivery_option ?? $order->delivery_option,
                    'shipping_address' => $request->shipping_address ?? $order->shipping_address,
                ]);
            }
            
            // Notify admin (single notification, no duplicate)
            $order->load('user');
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new ProductOrderPaymentUploadedNotification($order));
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment screenshot uploaded successfully. We will verify it shortly.',
                'order' => $order
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a pending order.
     */
    public function cancel($id)
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

        // Only pending orders can be cancelled
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending orders can be cancelled'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Restore product stock
            foreach ($order->items as $item) {
                $product = Product::find($item['id']);
                if ($product) {
                    $product->increment('stock', $item['quantity']);
                }
            }

            // Update order status
            $order->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment screenshot URL.
     */
    public function screenshot($id)
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

        if (!$order->payment_screenshot) {
            return response()->json([
                'success' => false,
                'message' => 'No screenshot uploaded'
            ], 404);
        }

        // Return full URL for direct access
        $imageUrl = url('storage/' . $order->payment_screenshot);

        return response()->json([
            'success' => true,
            'image_url' => $imageUrl
        ]);
    }
        /**
     * ✅ NEW: Check and process expired orders (return stock, send email)
     */
    public function processExpiredOrders()
    {
        $user = Auth::user();
        
        // Find all rejected orders for this user where deadline has passed and not yet permanently rejected
        $expiredOrders = ProductOrder::where('user_id', $user->id)
            ->where('status', 'rejected')
            ->where('permanently_rejected', false)
            ->where('rejection_deadline', '<', now())
            ->get();
        
        $processedCount = 0;
        
        foreach ($expiredOrders as $order) {
            try {
                // Return stock to products
                foreach ($order->items as $item) {
                    $product = Product::find($item['id']);
                    if ($product) {
                        $product->increment('stock', $item['quantity']);
                    }
                }
                
                // Mark as permanently rejected
                $order->update([
                    'permanently_rejected' => true,
                ]);
                
                // Send email notification
                try {
                    if ($order->user && $order->user->email) {
                        \Illuminate\Support\Facades\Mail::to($order->user->email)
                            ->send(new \App\Mail\OrderDeadlineExpiredMail($order));
                    }
                } catch (\Exception $e) {
                    \Log::error('Deadline expired email failed: ' . $e->getMessage());
                }
                
                $processedCount++;
                
            } catch (\Exception $e) {
                \Log::error('Failed to process expired order ' . $order->id . ': ' . $e->getMessage());
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => $processedCount . ' expired order(s) processed',
            'processed_count' => $processedCount
        ]);
    }
        /**
     * ✅ NEW: Bulk delete orders (soft delete)
     * Only allows deletion of non-pending orders (approved, cancelled, rejected)
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:product_orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $orderIds = $request->order_ids;

        // Get orders that belong to the user
        $orders = ProductOrder::where('user_id', $user->id)
            ->whereIn('id', $orderIds)
            ->get();

        if ($orders->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No orders found'
            ], 404);
        }

        // Check if any orders are pending (cannot delete pending orders)
        $pendingOrders = $orders->filter(function($order) {
            return $order->status === 'pending';
        });

        if ($pendingOrders->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete pending orders. Please cancel them first.'
            ], 400);
        }

        try {
            // Perform soft delete
            $deletedCount = ProductOrder::whereIn('id', $orders->pluck('id'))->delete();

            return response()->json([
                'success' => true,
                'message' => $deletedCount . ' order(s) deleted successfully',
                'deleted_count' => $deletedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete orders: ' . $e->getMessage()
            ], 500);
        }
    }
}