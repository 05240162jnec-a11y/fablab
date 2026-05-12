<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use App\Mail\OrderStatusMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CourseEnrollmentController extends Controller
{
    // enroll in a course - user
    public function enroll(Request $request)
    {
        $request->validate([
            'course_id' => 'required|integer',
        ]);

        $course = Course::findOrFail($request->course_id);

        // check if seats available
        $enrolledCount = $course->enrollments()
            ->where('status', 'enrolled')->count();

        if ($enrolledCount >= $course->max_seats) {
            return response()->json([
                'message' => 'Sorry, this course is full. No seats available.',
            ], 400);
        }

        // check if already enrolled
        $existing = CourseEnrollment::where('user_id', $request->user()->id)
            ->where('course_id', $request->course_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You are already enrolled in this course.',
            ], 400);
        }

        // create enrollment
        $enrollment = CourseEnrollment::create([
            'user_id'   => $request->user()->id,
            'course_id' => $request->course_id,
            'status'    => 'enrolled',
        ]);

        return response()->json([
            'message'    => 'Enrolled successfully! You will receive details soon.',
            'enrollment' => $enrollment,
        ], 201);
    }

    // get user enrollments
    public function userEnrollments(Request $request)
    {
        $enrollments = CourseEnrollment::with('course')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($enrollments);
    }

    // get all enrollments - admin
    public function adminEnrollments()
    {
        $enrollments = CourseEnrollment::with(['user', 'course'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($enrollments);
    }

    // mark training as completed - admin
    public function markCompleted(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'nullable|string',
        ]);

        $enrollment = CourseEnrollment::with(['user', 'course'])->findOrFail($id);

        // update enrollment status
        $enrollment->status             = 'completed';
        $enrollment->certificate_issued = true;
        $enrollment->completed_at       = now();
        $enrollment->admin_note         = $request->admin_note;
        $enrollment->save();

        // update user is_trained to true
        $user = User::findOrFail($enrollment->user_id);
        $user->is_trained = true;
        $user->save();

        // send congratulations email to user
        try {
            Mail::to($user->email)->send(
                new TrainingCompletedMail($enrollment)
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send training email: ' . $e->getMessage());
        }

        return response()->json([
            'message'    => 'Training marked as completed. User can now book machines.',
            'enrollment' => $enrollment,
        ]);
    }

    // cancel enrollment - user
    public function cancel(Request $request, $id)
    {
        $enrollment = CourseEnrollment::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        $enrollment->status = 'cancelled';
        $enrollment->save();

        return response()->json(['message' => 'Enrollment cancelled successfully']);
    }
}