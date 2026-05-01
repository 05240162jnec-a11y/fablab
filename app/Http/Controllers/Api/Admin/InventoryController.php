<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    // Get all inventory data
    public function index()
    {
        $materials = Material::with('transactions')->get();
        $received = InventoryTransaction::where('type', 'received')->with('material')->latest()->get();
        $issued = InventoryTransaction::where('type', 'issued')->with('material')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'materials' => $materials,
                'received' => $received,
                'issued' => $issued,
            ]
        ]);
    }

    // Add received material
    public function addReceived(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'rate' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
        ]);

        // Find or create material
        $material = Material::firstOrCreate(
            ['name' => $validated['name']],
            [
                'description' => $validated['description'],
                'rate' => $validated['rate'],
                'quantity' => 0,
            ]
        );

        // Update material rate if different
        if ($material->rate != $validated['rate']) {
            $material->rate = $validated['rate'];
            $material->save();
        }

        // Add to quantity
        $material->quantity += $validated['quantity'];
        $material->save();

        // Create transaction
        $transaction = InventoryTransaction::create([
            'material_id' => $material->id,
            'type' => 'received',
            'quantity' => $validated['quantity'],
            'rate' => $validated['rate'],
            'transaction_date' => $validated['transaction_date'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Material received successfully',
            'data' => $transaction
        ], 201);
    }

    // Issue material
    public function issueMaterial(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'transaction_date' => 'required|date',
            'reason' => 'nullable|string',
        ]);

        $material = Material::where('name', $validated['name'])->first();
        
        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }

        if ($material->quantity < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock! Current stock: ' . $material->quantity
            ], 422);
        }

        // Deduct from quantity
        $material->quantity -= $validated['quantity'];
        $material->save();

        // Create transaction
        $transaction = InventoryTransaction::create([
            'material_id' => $material->id,
            'type' => 'issued',
            'quantity' => $validated['quantity'],
            'transaction_date' => $validated['transaction_date'],
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Material issued successfully',
            'data' => $transaction
        ], 201);
    }

    // Delete received transaction
    public function deleteReceived($id)
    {
        $transaction = InventoryTransaction::findOrFail($id);
        
        if ($transaction->type !== 'received') {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete received transactions'
            ], 422);
        }

        // Remove from material quantity
        $material = $transaction->material;
        $material->quantity -= $transaction->quantity;
        $material->save();

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Received record deleted successfully'
        ]);
    }

    // Delete issued transaction
    public function deleteIssued($id)
    {
        $transaction = InventoryTransaction::findOrFail($id);
        
        if ($transaction->type !== 'issued') {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete issued transactions'
            ], 422);
        }

        // Add back to material quantity
        $material = $transaction->material;
        $material->quantity += $transaction->quantity;
        $material->save();

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Issued record deleted successfully'
        ]);
    }
}