<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\CertificateGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CertificateController extends Controller
{
    public function uploadTemplate(Request $request, $id)
{
    $course = Course::findOrFail($id);

    // Check if we're uploading a new image or just updating positions
    if ($request->hasFile('template_image')) {
        // ✅ Uploading new template
        $request->validate([
            'template_image' => 'required|image|mimes:png,jpg,jpeg|max:5120',
            'template_config' => 'required|json',
        ]);

        // Store image in public disk (for preview)
        $file = $request->file('template_image');
        $filename = 'cert_template_' . time() . '_' . $course->id . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('certificates/templates', $filename, 'public');

        // Save to database
        $course->update([
            'certificate_template_path' => $path,
            'certificate_template_config' => json_decode($request->template_config, true),
        ]);

        return response()->json([
            'message' => 'Template uploaded successfully!',
            'template_url' => Storage::url($path),
            'config' => $course->certificate_template_config,
        ], 200);
    } else {
        // ✅ Just updating positions (no new image)
        $request->validate([
            'template_config' => 'required|json',
        ]);

        // Check if template exists
        if (!$course->certificate_template_path) {
            return response()->json(['message' => 'No template uploaded yet. Please upload a template first.'], 422);
        }

        // Update only the config
        $course->update([
            'certificate_template_config' => json_decode($request->template_config, true),
        ]);

        return response()->json([
    'message' => "Generated {$generatedCount} certificates. Skipped {$skippedCount} (already generated).",
    'generated' => $generatedCount,
    'skipped' => $skippedCount,
    'total_processed' => $enrollments->count(),
], 200);
    }
}

    /**
     * Generate Certificates for Completed Users
     */
    public function generateCertificates($id)
    {
        $course = Course::findOrFail($id);

        // Check if course end date has passed
        if (!$course->end_date || now()->lessThan($course->end_date)) {
            return response()->json(['message' => 'Course has not ended yet.'], 422);
        }

        // Check if template exists
        if (!$course->certificate_template_path) {
            return response()->json(['message' => 'No template uploaded for this course.'], 422);
        }

        // Get completed enrollments
        $enrollments = \App\Models\CourseEnrollment::where('course_id', $course->id)
            ->where('status', 'completed')
            ->get();

        if ($enrollments->isEmpty()) {
            return response()->json([
                'message' => 'No completed students found.',
                'debug' => [
                    'course_id' => $course->id,
                    'total_enrollments' => \App\Models\CourseEnrollment::where('course_id', $course->id)->count(),
                    'completed_enrollments' => \App\Models\CourseEnrollment::where('course_id', $course->id)->where('status', 'completed')->count()
                ]
            ], 422);
        }

        $generator = new CertificateGenerator();
        $generatedCount = 0;
        $skippedCount = 0;
        $errors = [];

        foreach ($enrollments as $enrollment) {
            // Skip if already generated
            if ($enrollment->certificate_path) {
                $skippedCount++;
                continue;
            }

            $user = $enrollment->user;
            
            // Extract student number (first 8 chars of email before @)
            $studentNo = $user->id; // Fallback
            if ($user->email) {
                $emailParts = explode('@', $user->email);
                if (isset($emailParts[0]) && strlen($emailParts[0]) >= 8) {
                    $studentNo = substr($emailParts[0], 0, 8);
                } else {
                    $studentNo = $emailParts[0];
                }
            }

            // Define data for placeholders
            $data = [
                'name' => $user->name,
                'student_no' => $studentNo,
                'course_title' => $course->title,
                'start_date' => $course->start_date?->format('Y-m-d'),
                'end_date' => $course->end_date?->format('Y-m-d'),
            ];

            // Define file paths
            // ✅ FIXED: Input path - certificate_template_path already includes 'certificates/...'
            $inputPath = storage_path('app/public/' . $course->certificate_template_path);
            
            // Output: storage/app/private/certificates/generated/...
            $filename = "cert_{$studentNo}_{$course->id}.pdf";
            $outputPath = storage_path('app/private/certificates/generated/' . $filename);

            // Generate the certificate
            try {
                $generator->generate(
                    $inputPath, 
                    $course->certificate_template_config, 
                    $data, 
                    $outputPath
                );

                // Save path to enrollment (relative to storage/app/private)
                $enrollment->certificate_path = 'certificates/generated/' . $filename;
                $enrollment->save();
                $generatedCount++;
            } catch (\Exception $e) {
                Log::error("Certificate generation failed for user {$user->id}: " . $e->getMessage());
                $errors[] = "User {$user->id}: " . $e->getMessage();
            }
        }

        // ✅ Return detailed debug info
        if (count($errors) > 0) {
            return response()->json([
                'message' => "Processed {$enrollments->count()} enrollments.",
                'generated' => $generatedCount,
                'skipped' => $skippedCount,
                'errors' => $errors,
            ], 207);
        }

        return response()->json([
            'message' => "Successfully generated {$generatedCount} certificates!",
            'count' => $generatedCount,
        ], 200);
    }
}