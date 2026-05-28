<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\InventoryReceived;
use App\Models\InventoryIssued;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Display a listing of the inventory.
     */
    public function index(Request $request)
    {
        try {
            // Get all materials
            $materials = Material::select('id', 'name')->get();

            // Get all received records with material relationship
            $received = InventoryReceived::with('material')->latest()->get();

            // Get all issued records with material relationship
            $issued = InventoryIssued::with('material')->latest()->get();

            // Calculate Stock for each material
            $stockData = [];
            foreach ($materials as $material) {
                $totalReceived = InventoryReceived::where('material_id', $material->id)->sum('quantity');
                $totalIssued = InventoryIssued::where('material_id', $material->id)->sum('quantity');
                
                $stockData[] = [
                    'id' => $material->id,
                    'name' => $material->name,
                    'quantity' => $totalReceived - $totalIssued,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'materials' => $materials,
                    'received' => $received,
                    'issued' => $issued,
                    'materials' => $stockData, // Returning calculated stock
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a new material to the Master List.
     */
    public function addMaterial(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:materials,name',
        ]);

        $material = Material::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Material added successfully.',
            'data' => $material,
        ]);
    }

    /**
     * Add received material.
     */
    public function addReceived(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'rate' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'received_by' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // Find or create the material
            $material = Material::firstOrCreate(
                ['name' => $validated['name']]
            );

            // Create the received record
            InventoryReceived::create([
                'material_id' => $material->id,
                'name' => $material->name, // Store name for backward compatibility/ease
                'description' => $validated['description'],
                'quantity' => $validated['quantity'],
                'rate' => $validated['rate'],
                'transaction_date' => $validated['transaction_date'],
                'received_by' => $validated['received_by'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Material received successfully.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add received material.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Issue material.
     */
    public function issueMaterial(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'transaction_date' => 'required|date',
            'issued_to' => 'required|string',
            'reason' => 'nullable|string',
            'issued_by' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // Find or create the material
            $material = Material::firstOrCreate(
                ['name' => $validated['name']]
            );

            // Check Stock
            $totalReceived = InventoryReceived::where('material_id', $material->id)->sum('quantity');
            $totalIssued = InventoryIssued::where('material_id', $material->id)->sum('quantity');
            $currentStock = $totalReceived - $totalIssued;

            if ($currentStock < $validated['quantity']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock. Current stock: ' . $currentStock,
                ], 422);
            }

            // Create issued record
            InventoryIssued::create([
                'material_id' => $material->id,
                'name' => $material->name,
                'quantity' => $validated['quantity'],
                'transaction_date' => $validated['transaction_date'],
                'issued_to' => $validated['issued_to'],
                'reason' => $validated['reason'],
                'issued_by' => $validated['issued_by'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Material issued successfully.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to issue material.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete received record.
     */
    public function deleteReceived($id)
    {
        try {
            $record = InventoryReceived::findOrFail($id);
            $record->delete();

            return response()->json([
                'success' => true,
                'message' => 'Record deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete record.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete issued record.
     */
    public function deleteIssued($id)
    {
        try {
            $record = InventoryIssued::findOrFail($id);
            $record->delete();

            return response()->json([
                'success' => true,
                'message' => 'Issued record deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete issued record.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

        /**
     * Get Admin and Production Team members for dropdown
     */
    public function getTeamMembers()
    {
        try {
            // ✅ Fetch users with roles: admin, production, production_team, staff
            // Adjust these role names to match exactly what is in your database
            $roles = ['admin', 'production', 'production_team', 'staff'];
            
            $users = \App\Models\User::whereIn('role', $roles)
                ->select('id', 'name', 'role')
                ->get()
                ->map(function ($user) {
                    // Format the role for display
                    $roleDisplay = 'Member';
                    if ($user->role === 'admin') {
                        $roleDisplay = 'Admin';
                    } elseif (in_array($user->role, ['production', 'production_team'])) {
                        $roleDisplay = 'Production Team member';
                    } elseif ($user->role === 'staff') {
                        $roleDisplay = 'Staff';
                    }

                    return [
                        'id' => $user->id,
                        'name' => $user->name . ' (' . $roleDisplay . ')',
                        'value' => $user->name, // Store just the name for saving
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch team members.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}