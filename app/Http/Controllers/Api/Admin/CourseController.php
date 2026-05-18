<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use ZipArchive;

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

    // Create new course - ✅ REMOVED duration & schedule
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'instructor' => 'required|string|max:255',
            // ❌ REMOVED: 'duration' => 'required|string',
            
            // ✅ Date fields for auto-complete
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            
            // ❌ REMOVED: 'schedule' => 'nullable|string|max:255',
            
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

    // Update course - ✅ REMOVED duration & schedule
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'instructor' => 'sometimes|required|string|max:255',
            // ❌ REMOVED: 'duration' => 'sometimes|required|string',
            
            // ✅ Date fields (required if provided)
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            
            // ❌ REMOVED: 'schedule' => 'sometimes|nullable|string|max:255',
            
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
        
        // Toggle the BOOLEAN field that frontend uses
        $course->registration_open = !$course->registration_open;
        
        // Keep the STRING field in sync (for admin panel display)
        $course->registration_status = $course->registration_open ? 'open' : 'closed';
        
        $course->save();

        return response()->json([
            'success' => true,
            'message' => 'Registration status updated',
            'data' => $course
        ]);
    }

    // OPTIONAL: Manual trigger for auto-complete (for admin testing)
    public function autoComplete()
    {
        try {
            // Call the artisan command programmatically
            \Illuminate\Support\Facades\Artisan::call('courses:complete-expired');
            
            $output = \Illuminate\Support\Facades\Artisan::output();
            
            return response()->json([
                'success' => true,
                'message' => 'Auto-complete executed successfully',
                'output' => $output,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Auto-complete failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // NEW: Get all enrolled users for a specific course (filtered by is_active)
    public function getEnrollments($courseId)
    {
        $course = Course::findOrFail($courseId);
        
        // Get all ACTIVE enrollments for this course with user details
        $enrollments = DB::table('course_enrollments')
            ->join('users', 'course_enrollments.user_id', '=', 'users.id')
            ->where('course_enrollments.course_id', $courseId)
            ->where('course_enrollments.is_active', true)  // ✅ Only active enrollments
            ->where('course_enrollments.status', '!=', 'dropped')
            ->select(
                'course_enrollments.id as enrollment_id',
                'course_enrollments.status',
                'course_enrollments.is_active',
                'course_enrollments.created_at as enrolled_at',
                'users.id as user_id',
                'users.name',
                'users.email',
                'users.role',
                'users.department',
                'users.phone',
                'course_enrollments.enrollment_data'
            )
            ->orderBy('course_enrollments.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $enrollments,
            'total' => $enrollments->count(),
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'seat_limit' => $course->seat_limit,
                'enrollment_count' => $enrollments->count(),
            ]
        ]);
    }

    // NEW: Remove a user from a course (mark as dropped)
    public function removeEnrollment($courseId, $userId)
    {
        $enrollment = DB::table('course_enrollments')
            ->where('course_id', $courseId)
            ->where('user_id', $userId)
            ->first();
        
        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'Enrollment not found'
            ], 404);
        }
        
        // Update status to 'dropped' (soft delete)
        DB::table('course_enrollments')
            ->where('id', $enrollment->enrollment_id)
            ->update([
                'status' => 'dropped',
                'updated_at' => now()
            ]);
        
        return response()->json([
            'success' => true,
            'message' => 'User removed from course successfully'
        ]);
    }

    // NEW: Duplicate a course for a new semester - ✅ REMOVED duration & schedule
    public function duplicate(Request $request, $id)
    {
        $original = Course::findOrFail($id);
        
        // Validate new course details
        $validated = $request->validate([
            'new_title' => 'required|string|max:255',
            'new_start_date' => 'required|date|after:today',
            'new_end_date' => 'required|date|after:new_start_date',
            'seat_limit' => 'required|integer|min:1',
        ]);
        
        // Create new course with copied data - ✅ REMOVED duration & schedule
        $newCourse = Course::create([
            'title' => $validated['new_title'],
            'instructor' => $original->instructor,
            // ❌ REMOVED: 'duration' => $original->duration,
            'start_date' => $validated['new_start_date'],
            'end_date' => $validated['new_end_date'],
            // ❌ REMOVED: 'schedule' => $original->schedule,
            'seat_limit' => $validated['seat_limit'],
            'status' => 'upcoming',
            'registration_open' => false,
            'registration_status' => 'closed',
            'description' => $original->description,
            'image' => $original->image, // Reuse same image
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Course duplicated successfully! New course created with fresh enrollment.',
            'data' => $newCourse
        ], 201);
    }

    // NEW: Download enrolled users as CSV
    public function downloadEnrollments($courseId)
    {
        $course = Course::findOrFail($courseId);
        
        // Get all ACTIVE enrollments for this course
        $enrollments = DB::table('course_enrollments')
            ->join('users', 'course_enrollments.user_id', '=', 'users.id')
            ->where('course_enrollments.course_id', $courseId)
            ->where('course_enrollments.is_active', true)
            ->where('course_enrollments.status', '!=', 'dropped')
            ->select(
                'users.name',
                'users.email',
                'users.role',
                'users.department',
                'users.phone',
                'course_enrollments.status',
                'course_enrollments.created_at as enrolled_at'
            )
            ->orderBy('users.name')
            ->get();

        // Generate CSV content
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$course->title}_enrollments.csv\"",
        ];

        $callback = function() use ($enrollments) {
            $file = fopen('php://output', 'w');
            
            // CSV Header row
            fputcsv($file, [
                'Name',
                'Email',
                'Role',
                'Department',
                'Phone',
                'Status',
                'Enrolled Date'
            ]);
            
            // Data rows
            foreach ($enrollments as $enrollment) {
                fputcsv($file, [
                    $enrollment->name,
                    $enrollment->email,
                    $enrollment->role,
                    $enrollment->department ?? '',
                    $enrollment->phone,
                    $enrollment->status,
                    $enrollment->enrolled_at
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // NEW: Clear active enrollments (set is_active = false)
    public function clearActiveEnrollments($courseId)
    {
        $course = Course::findOrFail($courseId);
        
        // Count how many will be cleared
        $count = DB::table('course_enrollments')
            ->where('course_id', $courseId)
            ->where('is_active', true)
            ->where('status', '!=', 'dropped')
            ->count();
        
        if ($count === 0) {
            return response()->json([
                'success' => true,
                'message' => 'No active enrollments to clear.',
                'cleared' => 0
            ]);
        }
        
        // Update is_active to false (soft clear - keeps completion records!)
        DB::table('course_enrollments')
            ->where('course_id', $courseId)
            ->where('is_active', true)
            ->where('status', '!=', 'dropped')
            ->update([
                'is_active' => false,
                'updated_at' => now()
            ]);
        
        return response()->json([
            'success' => true,
            'message' => "Cleared {$count} active enrollment(s). Completion records preserved!",
            'cleared' => $count
        ]);
    }
}