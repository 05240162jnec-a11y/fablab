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

        // Calculate stats - ✅ Use in_use (with underscore)
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
            'status' => 'required|in:available,in_use,maintenance', // ✅ Use in_use
            'image' => 'nullable|image|max:5120', // 5MB max
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
            'status' => 'sometimes|in:available,in_use,maintenance', // ✅ Use in_use
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

    // ✅ Toggle maintenance mode with email notification
    public function toggleMaintenance(Request $request, $id)
    {
        $machine = Machine::findOrFail($id);
        
        $newStatus = $request->input('status');
        $notifyUsers = $request->input('notify_users', false);
        
        // Update machine status
        $machine->status = $newStatus;
        $machine->save();
        
        // Send email notifications if setting to maintenance AND notify_users is true
        if ($notifyUsers && $newStatus === 'maintenance') {
            // Get all users who have active/pending bookings for this machine
            $bookings = Booking::where('machine_id', $machine->id)
                ->whereIn('status', ['pending', 'confirmed', 'approved'])
                ->with('user')
                ->get();
            
            foreach ($bookings as $booking) {
                if ($booking->user && $booking->user->email) {
                    try {
                        // Send email notification
                        Mail::to($booking->user->email)->send(
                            new MachineMaintenanceNotification($machine, $booking)
                        );
                    } catch (\Exception $e) {
                        // Log error but continue with other users
                        \Log::error('Failed to send maintenance notification: ' . $e->getMessage());
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'maintenance' 
                ? 'Machine set to maintenance. Notifications sent to booked users.' 
                : 'Machine is now available.',
            'data' => $machine
        ]);
    }
}