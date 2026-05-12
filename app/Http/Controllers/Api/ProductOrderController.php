<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ProductOrder;
use Illuminate\Http\Request;

class ProductOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = ProductOrder::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                if ($order->payment_screenshot) {
                    $order->payment_screenshot_url = asset('storage/' . $order->payment_screenshot);
                }
                return $order;
            });
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_name'      => 'required|string',
            'category'          => 'required|string',
            'quantity'          => 'required|integer|min:1',
            'price'             => 'required|numeric',
            'total_price'       => 'required|numeric',
            'notes'             => 'nullable|string',
            'delivery_option'   => 'required|in:pickup,delivery',
            'delivery_address'  => 'nullable|string',
            'payment_screenshot'=> 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $screenshotPath = null;
        if ($request->hasFile('payment_screenshot')) {
            $screenshotPath = $request->file('payment_screenshot')
                ->store('payment_screenshots', 'public');
        }

        $order = ProductOrder::create([
            'user_id'            => $request->user()->id,
            'product_name'       => $request->product_name,
            'category'           => $request->category,
            'quantity'           => $request->quantity,
            'price'              => $request->price,
            'total_price'        => $request->total_price,
            'status'             => 'pending',
            'notes'              => $request->notes,
            'delivery_option'    => $request->delivery_option,
            'delivery_address'   => $request->delivery_address,
            'payment_screenshot' => $screenshotPath,
            'payment_status'     => $screenshotPath ? 'uploaded' : 'unpaid',
        ]);

        return response()->json([
            'message' => 'Order placed successfully!',
            'order'   => $order,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $order = ProductOrder::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        $order->delete();
        return response()->json(['message' => 'Order cancelled successfully']);
    }
}