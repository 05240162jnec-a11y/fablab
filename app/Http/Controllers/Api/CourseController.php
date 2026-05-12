<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // get all active courses - public
    public function index()
    {
        $courses = Course::where('status', 'active')
            ->orderBy('start_date', 'asc')
            ->get()
            ->map(function ($course) {
                $course->enrolled_count = $course->enrollments()
                    ->where('status', 'enrolled')->count();
                $course->seats_left = $course->max_seats - $course->enrolled_count;
                return $course;
            });

        return response()->json($courses);
    }

    // get all courses for admin
    public function adminIndex()
    {
        $courses = Course::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($course) {
                $course->enrolled_count = $course->enrollments()
                    ->where('status', 'enrolled')->count();
                $course->seats_left = $course->max_seats - $course->enrolled_count;
                return $course;
            });

        return response()->json($courses);
    }

    // add new course - admin only
    public function store(Request $request)
    {
        $request->validate([
            'title'              => 'required|string',
            'description'        => 'nullable|string',
            'instructor'         => 'required|string',
            'location'           => 'nullable|string',
            'duration_weeks'     => 'required|integer',
            'schedule'           => 'nullable|string',
            'max_seats'          => 'required|integer',
            'start_date'         => 'required|date',
            'status'             => 'required|string',
            'grants_certificate' => 'boolean',
        ]);

        $course = Course::create($request->all());

        return response()->json([
            'message' => 'Course added successfully',
            'course'  => $course,
        ], 201);
    }

    // update course - admin only
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $course->update($request->all());

        return response()->json([
            'message' => 'Course updated successfully',
            'course'  => $course,
        ]);
    }

    // delete course - admin only
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully',
        ]);
    }
}