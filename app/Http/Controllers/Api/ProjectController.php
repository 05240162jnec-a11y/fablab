<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    /**
     * Get all projects (with optional status filter)
     */
    public function index(Request $request)
    {
        $query = Project::with('user');
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $projects = $query->orderBy('submission_date', 'desc')->get();
        
        // Transform data for frontend
        $transformedProjects = $projects->map(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->student_name,
                'dept' => $project->department,
                'proj' => $project->title,
                'status' => ucfirst($project->status),
                'date' => $project->submission_date->format('M d, Y'),
                'description' => $project->description,
                'pdfFile' => $project->pdf_file ?? 'Project_Report.pdf',
                'videoFile' => $project->video_file ?? 'Demo_Video.mp4',
                'rejection_reason' => $project->rejection_reason,
            ];
        });
        
        return response()->json([
            'projects' => $transformedProjects,
        ]);
    }

    /**
     * Get single project details
     */
    public function show($id)
    {
        $project = Project::with('user')->findOrFail($id);
        
        return response()->json([
            'project' => [
                'id' => $project->id,
                'name' => $project->student_name,
                'dept' => $project->department,
                'proj' => $project->title,
                'status' => ucfirst($project->status),
                'date' => $project->submission_date->format('M d, Y'),
                'description' => $project->description,
                'pdfFile' => $project->pdf_file ?? 'Project_Report.pdf',
                'videoFile' => $project->video_file ?? 'Demo_Video.mp4',
                'rejection_reason' => $project->rejection_reason,
            ],
        ]);
    }

    /**
     * Approve a project
     */
    public function approve($id)
    {
        $project = Project::findOrFail($id);
        
        $project->update([
            'status' => 'approved',
        ]);
        
        return response()->json([
            'message' => 'Project approved successfully!',
            'project' => $project,
        ]);
    }

    /**
     * Reject a project with reason
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|min:10',
        ]);
        
        $project = Project::findOrFail($id);
        
        $project->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);
        
        return response()->json([
            'message' => 'Project rejected. Student will be notified.',
            'project' => $project,
        ]);
    }

    /**
     * Delete a project
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        
        return response()->json([
            'message' => 'Project deleted successfully!',
        ]);
    }
}