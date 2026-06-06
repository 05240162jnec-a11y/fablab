<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use App\Models\Booking;
use App\Mail\MachineMaintenanceNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;

class MachineController extends Controller
{
    // Get all machines with filters
    public function index(Request $request)
    {
        $query = Machine::query();

        // Search by name or type
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $machines = $query->latest()->get();

        // Calculate stats
        $stats = [
            'total' => $machines->count(),
            'available' => Machine::where('status', 'available')->count(),
            'in_use' => Machine::where('status', 'in_use')->count(),
            'maintenance' => Machine::where('status', 'maintenance')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $machines,
            'stats' => $stats
        ]);
    }

    // Get single machine
    public function show($id)
    {
        $machine = Machine::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $machine
        ]);
    }

    // Create new machine
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|in:available,in_use,maintenance',
            'image' => 'nullable|image|max:5120',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('machines', 'public');
        }

        $machine = Machine::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Machine added successfully',
            'data' => $machine
        ], 201);
    }

    // Update machine
    public function update(Request $request, $id)
    {
        $machine = Machine::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:available,in_use,maintenance',
            'image' => 'sometimes|nullable|image|max:5120',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($machine->image) {
                Storage::disk('public')->delete($machine->image);
            }
            $validated['image'] = $request->file('image')->store('machines', 'public');
        }

        $machine->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Machine updated successfully',
            'data' => $machine
        ]);
    }

    // Delete machine
    public function destroy($id)
    {
        $machine = Machine::findOrFail($id);

        // Delete image if exists
        if ($machine->image) {
            Storage::disk('public')->delete($machine->image);
        }

        $machine->delete();

        return response()->json([
            'success' => true,
            'message' => 'Machine deleted successfully'
        ]);
    }

    // ✅ SMART Toggle maintenance mode with booking status updates and email notifications
    public function toggleMaintenance(Request $request, $id)
    {
        $machine = Machine::findOrFail($id);
        
        $newStatus = $request->input('status');
        $notifyUsers = $request->input('notify_users', false);
        
        // Validate status
        if (!in_array($newStatus, ['available', 'maintenance'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status'
            ], 422);
        }
        
        // Update machine status
        $machine->status = $newStatus;
        $machine->save();
        
        // Refresh the model to ensure we have the latest data
        $machine = $machine->fresh();
        
        $emailsSent = 0;
        
        // ✅ SCENARIO 1: Setting to MAINTENANCE
        if ($newStatus === 'maintenance' && $notifyUsers) {
            // Get all active bookings for this machine
            $bookings = Booking::where('machine_id', $machine->id)
                ->whereIn('status', ['pending', 'confirmed', 'approved'])
                ->with('user')
                ->get();
            
            foreach ($bookings as $booking) {
                if ($booking->user && $booking->user->email) {
                    try {
                        // ✅ Update booking status to cancelled_due_to_maintenance
                        $booking->status = 'cancelled_due_to_maintenance';
                        $booking->save();
                        
                        // ✅ Send cancellation email
                        Mail::to($booking->user->email)->send(
                            new MachineMaintenanceNotification($machine, $booking, 'cancelled')
                        );
                        $emailsSent++;
                    } catch (\Exception $e) {
                        \Log::error('Failed to send maintenance cancellation notification: ' . $e->getMessage());
                    }
                }
            }
        }
        
        // ✅ SCENARIO 2: Setting back to AVAILABLE
        elseif ($newStatus === 'available' && $notifyUsers) {
            // Get all bookings that were cancelled due to maintenance
            $cancelledBookings = Booking::where('machine_id', $machine->id)
                ->where('status', 'cancelled_due_to_maintenance')
                ->with('user')
                ->get();
            
            foreach ($cancelledBookings as $booking) {
                if ($booking->user && $booking->user->email) {
                    try {
                        // ✅ Send "machine available again" email
                        Mail::to($booking->user->email)->send(
                            new MachineMaintenanceNotification($machine, $booking, 'available')
                        );
                        $emailsSent++;
                        
                        // Note: We keep the status as 'cancelled_due_to_maintenance' 
                        // so we have a record of who was affected
                    } catch (\Exception $e) {
                        \Log::error('Failed to send machine available notification: ' . $e->getMessage());
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'maintenance' 
                ? 'Machine set to maintenance mode. ' . $emailsSent . ' user(s) notified.' 
                : 'Machine is now available. ' . $emailsSent . ' user(s) notified.',
            'data' => $machine,
            'emails_sent' => $emailsSent
        ]);
    }
}