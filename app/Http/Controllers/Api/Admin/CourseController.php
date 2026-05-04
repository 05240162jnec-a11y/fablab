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

    // Create new course - ✅ UPDATED with date validation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'instructor' => 'required|string|max:255',
            'duration' => 'required|string',
            
            // ✅ NEW: Required date fields for auto-complete
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            
            // ✅ Schedule is now optional text for class times
            'schedule' => 'nullable|string|max:255',
            
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

    // Update course - ✅ UPDATED with date validation
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'instructor' => 'sometimes|required|string|max:255',
            'duration' => 'sometimes|required|string',
            
            // ✅ NEW: Date fields (required if provided)
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            
            // ✅ Schedule is now optional text for class times
            'schedule' => 'sometimes|nullable|string|max:255',
            
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

    // Toggle registration status - ✅ Already fixed earlier
    public function toggleRegistration($id)
    {
        $course = Course::findOrFail($id);
        
        // ✅ Toggle the BOOLEAN field that frontend uses
        $course->registration_open = !$course->registration_open;
        
        // ✅ Keep the STRING field in sync (for admin panel display)
        $course->registration_status = $course->registration_open ? 'open' : 'closed';
        
        $course->save();

        return response()->json([
            'success' => true,
            'message' => 'Registration status updated',
            'data' => $course
        ]);
    }

    // ✅ OPTIONAL: Manual trigger for auto-complete (for admin testing)
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

    // ✅ NEW: Get all enrolled users for a specific course (filtered by is_active)
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

    // ✅ NEW: Remove a user from a course (mark as dropped)
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

    // ✅ NEW: Duplicate a course for a new semester
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
        
        // Create new course with copied data
        $newCourse = Course::create([
            'title' => $validated['new_title'],
            'instructor' => $original->instructor,
            'duration' => $original->duration,
            'start_date' => $validated['new_start_date'],
            'end_date' => $validated['new_end_date'],
            'schedule' => $original->schedule,
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

    // ✅ NEW: Download enrolled users as CSV
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

    // ✅ NEW: Clear active enrollments (set is_active = false)
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

    // ✅ NEW: Upload certificate template for a course
    public function uploadCertificateTemplate(Request $request, $id)
    {
        $request->validate([
            'template' => 'required|image|max:5120', // 5MB max, PNG/JPG
        ]);
        
        $course = Course::findOrFail($id);
        
        // Delete old template if exists
        if ($course->certificate_template_path) {
            Storage::disk('public')->delete($course->certificate_template_path);
        }
        
        // Store new template
        $path = $request->file('template')->store('certificate_templates', 'public');
        
        $course->update([
            'certificate_template_path' => $path
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Certificate template uploaded successfully',
            'data' => [
                'path' => $path,
                'url' => Storage::url($path)
            ]
        ]);
    }

    // ✅ NEW: Remove certificate template from a course
    public function removeCertificateTemplate($id)
    {
        $course = Course::findOrFail($id);
        
        if ($course->certificate_template_path) {
            Storage::disk('public')->delete($course->certificate_template_path);
            $course->update([
                'certificate_template_path' => null
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Certificate template removed successfully'
        ]);
    }

    // ✅ NEW: Generate certificate PDF for a specific user
    public function generateCertificate($courseId, $userId)
    {
        try {
            // ✅ DEBUG: Log auth status
            \Log::info('=== CERTIFICATE REQUEST ===');
            \Log::info('Course ID: ' . $courseId);
            \Log::info('User ID: ' . $userId);
            \Log::info('Auth User ID: ' . (auth()->id() ?? 'GUEST'));
            \Log::info('Auth Check: ' . (auth()->check() ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'));
            
            $course = Course::findOrFail($courseId);
            $user = \App\Models\User::findOrFail($userId);
            
            // Get enrollment record
            $enrollment = DB::table('course_enrollments')
                ->where('course_id', $courseId)
                ->where('user_id', $userId)
                ->first();
            
            if (!$enrollment) {
                \Log::error('Enrollment not found for course ' . $courseId . ' user ' . $userId);
                return response()->json([
                    'success' => false,
                    'message' => 'Enrollment not found'
                ], 404);
            }
            
            if ($enrollment->status !== 'completed') {
                \Log::error('User ' . $userId . ' has status ' . $enrollment->status . ' (not completed)');
                return response()->json([
                    'success' => false,
                    'message' => 'User has not completed this course'
                ], 400);
            }
            
            // Generate unique certificate ID if not exists
            if (!$enrollment->certificate_id) {
                $certId = 'CERT-' . date('Y') . '-' . str_pad($enrollment->id, 4, '0', STR_PAD_LEFT);
                DB::table('course_enrollments')
                    ->where('id', $enrollment->id)
                    ->update([
                        'certificate_id' => $certId,
                        'certificate_generated_at' => now()
                    ]);
                $enrollment->certificate_id = $certId;
            }
            
            // Check if template exists
            if (!$course->certificate_template_path) {
                \Log::error('No certificate template for course ' . $courseId);
                return response()->json([
                    'success' => false,
                    'message' => 'No certificate template uploaded for this course'
                ], 400);
            }
            
            // Load template image
            $templatePath = storage_path('app/public/' . $course->certificate_template_path);
            
            if (!file_exists($templatePath)) {
                \Log::error('Template file not found: ' . $templatePath);
                return response()->json([
                    'success' => false,
                    'message' => 'Certificate template file not found'
                ], 404);
            }
            
            // ✅ Use standard A4 dimensions (in points at 72 DPI)
            // No need for getimagesize() which can fail with DomPDF
            $width = 842;   // A4 width
            $height = 595;  // A4 height
            
            // ✅ Parse enrollment data for student number
            $enrollmentData = json_decode($enrollment->enrollment_data ?? '{}', true);
            $studentNumber = $enrollmentData['student_number'] ?? $enrollmentData['phone'] ?? 'N/A';
            
            // ✅ Extract dates from course
            $startDate = $course->start_date ? \Carbon\Carbon::parse($course->start_date)->format('jS F Y') : 'N/A';
            $endDate = $course->end_date ? \Carbon\Carbon::parse($course->end_date)->format('jS F Y') : 'N/A';
            
            // Create PDF
            $pdf = Pdf::loadView('admin.certificates.certificate', [
                'template_path' => $course->certificate_template_path,
                'student_name' => $user->name,
                'student_number' => $studentNumber,
                'course_name' => $course->title,
                'completion_date' => $enrollment->completed_at ? \Carbon\Carbon::parse($enrollment->completed_at)->format('F d, Y') : \Carbon\Carbon::now()->format('F d, Y'),
                'certificate_id' => $enrollment->certificate_id,
                'instructor_name' => $course->instructor,
                'issue_date' => \Carbon\Carbon::now()->format('F d, Y'),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'width' => $width,
                'height' => $height
            ]);
            
            $pdf->setPaper([0, 0, $width, $height], 'portrait');
            
            // Return as download
            $filename = 'Certificate_' . str_replace(' ', '_', $user->name) . '_' . $enrollment->certificate_id . '.pdf';
            
            \Log::info('Certificate generated successfully for user ' . $userId);
            return $pdf->download($filename);
            
        } catch (\Exception $e) {
            \Log::error('Certificate generation error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Error generating certificate: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ NEW: Generate certificates for ALL completed users in a course
    public function generateBulkCertificates($courseId)
    {
        try {
            // ✅ DEBUG: Log auth status for bulk generation
            \Log::info('=== BULK CERTIFICATE REQUEST ===');
            \Log::info('Course ID: ' . $courseId);
            \Log::info('Auth User ID: ' . (auth()->id() ?? 'GUEST'));
            \Log::info('Auth Check: ' . (auth()->check() ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'));
            
            $course = Course::findOrFail($courseId);
            
            // Get all completed enrollments
            $enrollments = DB::table('course_enrollments')
                ->join('users', 'course_enrollments.user_id', '=', 'users.id')
                ->where('course_enrollments.course_id', $courseId)
                ->where('course_enrollments.status', 'completed')
                ->select(
                    'course_enrollments.*',
                    'users.name as user_name',
                    'users.email'
                )
                ->get();
            
            if ($enrollments->count() === 0) {
                \Log::error('No completed users found for course ' . $courseId);
                return response()->json([
                    'success' => false,
                    'message' => 'No completed users found for this course'
                ], 404);
            }
            
            // Check if template exists
            if (!$course->certificate_template_path) {
                \Log::error('No certificate template for course ' . $courseId);
                return response()->json([
                    'success' => false,
                    'message' => 'No certificate template uploaded for this course'
                ], 400);
            }
            
            // Create temporary directory for PDFs
            $tempDir = storage_path('app/temp/certificates_' . $courseId);
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            $generatedFiles = [];
            
            // ✅ Extract dates from course (once, for all certificates)
            $startDate = $course->start_date ? \Carbon\Carbon::parse($course->start_date)->format('jS F Y') : 'N/A';
            $endDate = $course->end_date ? \Carbon\Carbon::parse($course->end_date)->format('jS F Y') : 'N/A';
            
            // Load template image (once)
            $templatePath = storage_path('app/public/' . $course->certificate_template_path);
            // ✅ Use standard A4 dimensions (in points at 72 DPI)
            $width = 842;   // A4 width
            $height = 595;  // A4 height
            
            // Generate PDF for each user
            foreach ($enrollments as $enrollment) {
                // Generate unique certificate ID if not exists
                if (!$enrollment->certificate_id) {
                    $certId = 'CERT-' . date('Y') . '-' . str_pad($enrollment->id, 4, '0', STR_PAD_LEFT);
                    DB::table('course_enrollments')
                        ->where('id', $enrollment->id)
                        ->update([
                            'certificate_id' => $certId,
                            'certificate_generated_at' => now()
                        ]);
                    $enrollment->certificate_id = $certId;
                }
                
                // ✅ Parse enrollment data for student number
                $enrollmentData = json_decode($enrollment->enrollment_data ?? '{}', true);
                $studentNumber = $enrollmentData['student_number'] ?? $enrollmentData['phone'] ?? 'N/A';
                
                // Create PDF
                $pdf = Pdf::loadView('admin.certificates.certificate', [
                    'template_path' => $course->certificate_template_path,
                    'student_name' => $enrollment->user_name,
                    'student_number' => $studentNumber,
                    'course_name' => $course->title,
                    'completion_date' => $enrollment->completed_at ? \Carbon\Carbon::parse($enrollment->completed_at)->format('F d, Y') : \Carbon\Carbon::now()->format('F d, Y'),
                    'certificate_id' => $enrollment->certificate_id,
                    'instructor_name' => $course->instructor,
                    'issue_date' => \Carbon\Carbon::now()->format('F d, Y'),
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'width' => $width,
                    'height' => $height
                ]);
                
                $pdf->setPaper([0, 0, $width, $height], 'portrait');
                
                // Save to temp directory
                $filename = 'Certificate_' . str_replace(' ', '_', $enrollment->user_name) . '_' . $enrollment->certificate_id . '.pdf';
                $filepath = $tempDir . '/' . $filename;
                $pdf->save($filepath);
                $generatedFiles[] = ['path' => $filepath, 'name' => $filename];
            }
            
            // Create ZIP file
            $zipFilename = 'Certificates_' . str_replace(' ', '_', $course->title) . '_' . date('Y-m-d') . '.zip';
            $zipPath = $tempDir . '/../' . $zipFilename;
            
            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
                foreach ($generatedFiles as $file) {
                    $zip->addFile($file['path'], $file['name']);
                }
                $zip->close();
            }
            
            // Clean up temp PDFs
            foreach ($generatedFiles as $file) {
                if (file_exists($file['path'])) {
                    unlink($file['path']);
                }
            }
            
            \Log::info('Bulk certificates generated successfully for course ' . $courseId);
            
            // Return ZIP download
            return response()->download($zipPath, $zipFilename)->deleteFileAfterSend(true);
            
        } catch (\Exception $e) {
            \Log::error('Bulk certificate generation error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Error generating certificates: ' . $e->getMessage()
            ], 500);
        }
    }
}