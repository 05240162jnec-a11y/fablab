<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MachineController extends Controller
{
    // get all active machines - public
    public function index()
    {
        $machines = Machine::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($machine) {
                $machine->image_url = $machine->image
                    ? asset('storage/' . $machine->image)
                    : null;
                return $machine;
            });
        return response()->json($machines);
    }

    // get all machines for admin
    public function adminIndex()
    {
        $machines = Machine::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($machine) {
                $machine->image_url = $machine->image
                    ? asset('storage/' . $machine->image)
                    : null;
                return $machine;
            });
        return response()->json($machines);
    }

    // add new machine - admin only
    public function store(Request $request)
    {
        $request->validate([
            'name'              => 'required|string',
            'category'          => 'required|string',
            'description'       => 'nullable|string',
            'status'            => 'required|string',
            'requires_training' => 'boolean',
            'max_booking_hours' => 'required|integer',
            'is_active'         => 'boolean',
            'image'             => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('machines', 'public');
        }

        $machine = Machine::create([
            'name'              => $request->name,
            'category'          => $request->category,
            'description'       => $request->description,
            'status'            => $request->status,
            'requires_training' => $request->requires_training ?? true,
            'max_booking_hours' => $request->max_booking_hours,
            'is_active'         => $request->is_active ?? true,
            'image'             => $imagePath,
        ]);

        $machine->image_url = $imagePath ? asset('storage/' . $imagePath) : null;

        return response()->json([
            'message' => 'Machine added successfully',
            'machine' => $machine,
        ], 201);
    }

    // update machine - admin only
    public function update(Request $request, $id)
    {
        $machine = Machine::findOrFail($id);

        $imagePath = $machine->image;
        if ($request->hasFile('image')) {
            if ($machine->image) {
                Storage::disk('public')->delete($machine->image);
            }
            $imagePath = $request->file('image')->store('machines', 'public');
        }

        $machine->update([
            'name'              => $request->name ?? $machine->name,
            'category'          => $request->category ?? $machine->category,
            'description'       => $request->description ?? $machine->description,
            'status'            => $request->status ?? $machine->status,
            'requires_training' => $request->requires_training ?? $machine->requires_training,
            'max_booking_hours' => $request->max_booking_hours ?? $machine->max_booking_hours,
            'is_active'         => $request->is_active ?? $machine->is_active,
            'image'             => $imagePath,
        ]);

        $machine->image_url = $imagePath ? asset('storage/' . $imagePath) : null;

        return response()->json([
            'message' => 'Machine updated successfully',
            'machine' => $machine,
        ]);
    }

    // delete machine - admin only
    public function destroy($id)
    {
        $machine = Machine::findOrFail($id);
        if ($machine->image) {
            Storage::disk('public')->delete($machine->image);
        }
        $machine->delete();

        return response()->json([
            'message' => 'Machine deleted successfully',
        ]);
    }
}