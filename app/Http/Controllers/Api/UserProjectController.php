<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserProjectController extends Controller
{
    /**
     * Get all projects submitted by the logged-in user
     */
            public function index()
    {
        $projects = Project::with(['user', 'reviewer'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'document_path' => $project->document_path,
                    // ✅ ADD THIS LINE
                    'student_photo' => $project->student_photo 
                        ? url('storage/' . $project->student_photo) 
                        : null,
                    'status' => $project->status,
                    'admin_comments' => $project->admin_comments,
                    'submitted_at' => $project->submitted_at,
                    'reviewed_at' => $project->reviewed_at,
                    'reviewer_name' => $project->reviewer ? $project->reviewer->name : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

        /**
     * Store a newly submitted project
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'document' => 'required|file|max:10240', // Max 10MB
            'photo' => 'nullable|image|mimes:png,jpg,jpeg|max:2048', // Max 2MB
        ]);

        // Store the document
        $path = $request->file('document')->store('projects/documents', 'public');

        // Store the photo if uploaded
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('project-photos', 'public');
        }

        $project = Project::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'document_path' => $path,
            'student_photo' => $photoPath,
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project submitted successfully! Awaiting admin approval.',
            'data' => $project
        ], 201);
    }

    /**
     * Update a rejected project (Resubmit)
     */
    public function update(Request $request, $id)
    {
        $project = Project::where('id', $id)->where('user_id', Auth::id())->first();

        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project not found'], 404);
        }

        // Users can edit PENDING and REJECTED projects (NOT approved)
        if ($project->status === 'approved') {
            return response()->json(['success' => false, 'message' => 'You cannot edit approved projects'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'document' => 'nullable|file|max:10240',
            'photo' => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        // If new document uploaded, delete old one and save new one
        if ($request->hasFile('document')) {
            Storage::delete($project->document_path);
            $path = $request->file('document')->store('projects/documents', 'public');
            $project->document_path = $path;
        }

        // If new photo uploaded, delete old one and save new one
        if ($request->hasFile('photo')) {
            if ($project->student_photo) {
                Storage::delete($project->student_photo);
            }
            $photoPath = $request->file('photo')->store('project-photos', 'public');
            $project->student_photo = $photoPath;
        }

        // Update fields and reset status to pending
        $project->update([
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
            'admin_comments' => null,
            'reviewed_at' => null,
            'reviewed_by' => null,
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project resubmitted successfully!',
            'data' => $project
        ]);
    }
public function download($id)
{
    $project = Project::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
    
    // Debug: Log the path we're trying to access
    \Log::info('Attempting to download file:', [
        'project_id' => $id,
        'document_path' => $project->document_path,
        'full_path' => storage_path('app/public/' . $project->document_path),
    ]);
    
    // Try multiple possible paths
    $possiblePaths = [
        storage_path('app/public/' . $project->document_path),
        storage_path('app/' . $project->document_path),
        public_path('storage/' . $project->document_path),
    ];
    
    $filePath = null;
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            $filePath = $path;
            break;
        }
    }
    
    if (!$filePath) {
        \Log::error('File not found in any location', [
            'project_id' => $id,
            'document_path' => $project->document_path,
            'checked_paths' => $possiblePaths,
        ]);
        
        return response()->json([
            'message' => 'File not found',
            'debug' => [
                'document_path' => $project->document_path,
                'checked_paths' => $possiblePaths,
            ]
        ], 404);
    }
    
    return response()->download($filePath, basename($project->document_path));
}
/**
 * Bulk delete projects
 */
public function bulkDelete(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'integer|exists:projects,id',
    ]);

    $projects = Project::whereIn('id', $request->ids)
        ->where('user_id', Auth::id())
        ->get();

    // Delete files from storage
    foreach ($projects as $project) {
        if ($project->document_path) {
            Storage::disk('public')->delete($project->document_path);
        }
    }

    // Delete projects from database
    Project::whereIn('id', $request->ids)
        ->where('user_id', Auth::id())
        ->delete();

    return response()->json([
        'success' => true,
        'message' => count($request->ids) . ' project(s) deleted successfully'
    ]);
}
/**
 * Cancel a pending project submission
 */
public function cancel($id)
{
    $project = Project::where('id', $id)
        ->where('user_id', Auth::id())
        ->first();

    if (!$project) {
        return response()->json([
            'success' => false,
            'message' => 'Project not found'
        ], 404);
    }

    // Only pending projects can be cancelled
    if ($project->status !== 'pending') {
        return response()->json([
            'success' => false,
            'message' => 'Only pending projects can be cancelled'
        ], 403);
    }

    // Update status to cancelled
    $project->update([
        'status' => 'cancelled',
        'admin_comments' => 'Cancelled by user',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Project cancelled successfully'
    ]);
}
}