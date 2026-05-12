<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomOrderController extends Controller
{
    // submit custom order - user
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string',
            'description' => 'required|string',
            'material'    => 'required|string',
            'quantity'    => 'required|integer|min:1',
            'deadline'    => 'nullable|date',
            'notes'       => 'nullable|string',
            'file'        => 'nullable|file|max:10240',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('custom-orders', 'public');
        }

        $order = CustomOrder::create([
            'user_id'     => $request->user()->id,
            'title'       => $request->title,
            'description' => $request->description,
            'material'    => $request->material,
            'quantity'    => $request->quantity,
            'deadline'    => $request->deadline,
            'notes'       => $request->notes,
            'file_path'   => $filePath,
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Custom order submitted successfully!',
            'order'   => $order,
        ], 201);
    }

    // get user custom orders
    public function userOrders(Request $request)
    {
        $orders = CustomOrder::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $order->file_url = $order->file_path
                    ? asset('storage/' . $order->file_path)
                    : null;
                return $order;
            });

        return response()->json($orders);
    }

    // get all custom orders - admin
    public function adminOrders()
    {
        $orders = CustomOrder::with(['user', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $order->file_url = $order->file_path
                    ? asset('storage/' . $order->file_path)
                    : null;
                return $order;
            });

        return response()->json($orders);
    }

    // assign order to production team - admin
    public function assignOrder(Request $request, $id)
    {
        $request->validate([
            'assigned_to' => 'required|integer',
            'admin_note'  => 'nullable|string',
        ]);

        $order = CustomOrder::findOrFail($id);
        $order->assigned_to = $request->assigned_to;
        $order->admin_note  = $request->admin_note;
        $order->status      = 'in_progress';
        $order->save();

        return response()->json([
            'message' => 'Order assigned successfully!',
            'order'   => $order,
        ]);
    }

    // update order status - admin
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'     => 'required|string|in:pending,in_progress,completed,rejected',
            'admin_note' => 'nullable|string',
        ]);

        $order = CustomOrder::findOrFail($id);
        $order->status     = $request->status;
        $order->admin_note = $request->admin_note;
        if ($request->status === 'completed') {
            $order->completed_at = now();
        }
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully!',
            'order'   => $order,
        ]);
    }

    // get assigned orders - production team
    public function myAssignedOrders(Request $request)
    {
        $orders = CustomOrder::with('user')
            ->where('assigned_to', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $order->file_url = $order->file_path
                    ? asset('storage/' . $order->file_path)
                    : null;
                return $order;
            });

        return response()->json($orders);
    }

    // update production note and status - production team
    public function updateProductionStatus(Request $request, $id)
    {
        $request->validate([
            'status'          => 'required|string|in:in_progress,completed',
            'production_note' => 'nullable|string',
        ]);

        $order = CustomOrder::where('id', $id)
            ->where('assigned_to', $request->user()->id)
            ->firstOrFail();

        $order->status          = $request->status;
        $order->production_note = $request->production_note;
        if ($request->status === 'completed') {
            $order->completed_at = now();
        }
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully!',
            'order'   => $order,
        ]);
    }
}