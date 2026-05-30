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

            // ✅ Get all issued records - explicitly select all needed columns including new ones
            $issued = InventoryIssued::with('material')
                ->select('id', 'material_id', 'name', 'quantity', 'transaction_date', 
                         'issued_to', 'issued_to_email', 'issued_to_department', 
                         'reason', 'issued_by', 'created_at', 'updated_at')
                ->latest()
                ->get();

            // Get threshold setting
            $thresholdSetting = \App\Models\Setting::where('key', 'stock_alert_threshold')->first();
            $threshold = $thresholdSetting ? (int)$thresholdSetting->value : 10;

            // Calculate Stock for each material (sorted by latest update)
            $stockData = [];
            foreach ($materials as $material) {
                $totalReceived = InventoryReceived::where('material_id', $material->id)->sum('quantity');
                $totalIssued = InventoryIssued::where('material_id', $material->id)->sum('quantity');
                
                // Get latest updated_at from received or issued records
                $latestReceived = InventoryReceived::where('material_id', $material->id)->max('updated_at');
                $latestIssued = InventoryIssued::where('material_id', $material->id)->max('updated_at');
                $latestUpdate = max($latestReceived, $latestIssued);
                
                $stockData[] = [
                    'id' => $material->id,
                    'name' => $material->name,
                    'quantity' => $totalReceived - $totalIssued,
                    'updated_at' => $latestUpdate,
                ];
            }

            // Sort by latest update (DESC)
            usort($stockData, function($a, $b) {
                return strtotime($b['updated_at']) - strtotime($a['updated_at']);
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'materials' => $materials,
                    'received' => $received,
                    'issued' => $issued, // ✅ Now includes issued_to_email and issued_to_department
                    'materials' => $stockData,
                    'threshold' => $threshold,
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
            'received_by_role' => 'required|string', // ✅ This field
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
                'name' => $material->name,
                'description' => $validated['description'],
                'quantity' => $validated['quantity'],
                'rate' => $validated['rate'],
                'transaction_date' => $validated['transaction_date'],
                'received_by' => $validated['received_by'],
                'received_by_role' => $validated['received_by_role'], // ✅ Save the role
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

        /**
     * Get stock alert threshold setting
     */
    public function getStockAlertThreshold()
    {
        try {
            $setting = \App\Models\Setting::where('key', 'stock_alert_threshold')->first();
            
            // Default to 10 if not set
            $threshold = $setting ? (int)$setting->value : 10;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'threshold' => $threshold,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch threshold.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock alert threshold setting
     */
    public function updateStockAlertThreshold(Request $request)
    {
        $validated = $request->validate([
            'threshold' => 'required|integer|min:0',
        ]);

        try {
            \App\Models\Setting::updateOrCreate(
                ['key' => 'stock_alert_threshold'],
                [
                    'value' => $validated['threshold'],
                    'description' => 'Stock alert threshold for inventory',
                ]
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Threshold updated successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update threshold.',
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
            'transaction_date' => 'required|date|after_or_equal:today', // ✅ Prevent past dates
            'issued_to' => 'required|string',
            'issued_to_email' => 'nullable|email',
            'issued_to_department' => 'nullable|string',
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
                'issued_to_email' => $validated['issued_to_email'] ?? null,
                'issued_to_department' => $validated['issued_to_department'] ?? null,
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
     * Get departments and users for issued material dropdown
     */
    public function getDepartmentsAndUsers()
    {
        try {
            // ✅ Get distinct departments from users table (students and faculty)
            $departments = \App\Models\User::whereIn('role', ['student', 'faculty'])
                ->whereNotNull('department')
                ->distinct()
                ->pluck('department')
                ->filter()
                ->values();

            // ✅ Get all users with student/faculty/production roles - explicitly select role
            $users = \App\Models\User::whereIn('role', ['student', 'faculty', 'production', 'production_team'])
                ->select('id', 'name', 'email', 'department', 'role') // ✅ Explicitly select role
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'department' => $user->department,
                        'role' => $user->role, // ✅ Include role in response
                        'display' => $user->name . ' - ' . $user->email,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'departments' => $departments,
                    'users' => $users,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments and users.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}