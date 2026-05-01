<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    // Get all courses
    public function index()
    {
        $courses = Course::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    }

    // Get single course
    public function show($id)
    {
        $course = Course::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $course
        ]);
    }

    // Create new course
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'instructor' => 'required|string|max:255',
            'duration' => 'required|string',
            'schedule' => 'required|string',
            'seat_limit' => 'required|integer|min:1',
            'status' => 'required|in:upcoming,active,completed',
            'registration_status' => 'required|in:open,closed',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120', // 5MB max
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('courses', 'public');
        }

        $course = Course::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully',
            'data' => $course
        ], 201);
    }

    // Update course
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'instructor' => 'sometimes|required|string|max:255',
            'duration' => 'sometimes|required|string',
            'schedule' => 'sometimes|required|string',
            'seat_limit' => 'sometimes|required|integer|min:1',
            'enrollment' => 'sometimes|integer|min:0',
            'status' => 'sometimes|required|in:upcoming,active,completed',
            'registration_status' => 'sometimes|required|in:open,closed',
            'description' => 'sometimes|nullable|string',
            'image' => 'sometimes|nullable|image|max:5120',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }
            $validated['image'] = $request->file('image')->store('courses', 'public');
        }

        $course->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully',
            'data' => $course
        ]);
    }

    // Delete course
    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        // Delete image if exists
        if ($course->image) {
            Storage::disk('public')->delete($course->image);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    }

    // Toggle registration status
    public function toggleRegistration($id)
    {
        $course = Course::findOrFail($id);
        
        $course->registration_status = $course->registration_status === 'open' ? 'closed' : 'open';
        $course->save();

        return response()->json([
            'success' => true,
            'message' => 'Registration status updated',
            'data' => $course
        ]);
    }
}