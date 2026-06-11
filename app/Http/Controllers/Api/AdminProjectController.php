<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Notifications\ProjectStatusNotification;

class AdminProjectController extends Controller
{
    /**
     * Get all project submissions (for admin dashboard)
     */
        public function index()
    {
        $projects = Project::with(['user', 'reviewer'])
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($project) {
                $reviewer = null;
                
                if ($project->reviewer) {
                    $reviewer = [
                        'id' => $project->reviewer->id,
                        'name' => $project->reviewer->name,
                        'email' => $project->reviewer->email,
                    ];
                } elseif ($project->reviewed_by) {
                    $user = \App\Models\User::find($project->reviewed_by);
                    if ($user) {
                        $reviewer = [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ];
                    } else {
                        $reviewer = [
                            'id' => $project->reviewed_by,
                            'name' => 'Admin User',
                            'email' => 'admin@jnec.rub.edu.bt',
                        ];
                    }
                }

                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'document_path' => $project->document_path,
                    // ✅ Make sure this returns full URL
                    'student_photo' => $project->student_photo 
                        ? url('storage/' . $project->student_photo) 
                        : null,
                    'status' => $project->status,
                    'admin_comments' => $project->admin_comments,
                    'submitted_at' => $project->submitted_at,
                    'reviewed_at' => $project->reviewed_at,
                    'user' => [
                        'id' => $project->user->id ?? null,
                        'name' => $project->user->name ?? 'Unknown',
                        'email' => $project->user->email ?? null,
                    ],
                    'reviewer' => $reviewer,
                ];
            });

        $stats = [
            'total' => $projects->count(),
            'pending' => $projects->where('status', 'pending')->count(),
            'approved' => $projects->where('status', 'approved')->count(),
            'rejected' => $projects->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $projects,
            'stats' => $stats
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
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
        ]);

        // Notify user via database notification
        $project->user->notify(new ProjectStatusNotification($project, 'approved'));

        // In-app notification
        if ($project->user) {
            $project->user->notify(new ProjectStatusNotification($project, 'approved'));
        }

        // ✅ Send Approval Email
        $user = User::find($project->user_id);
        if ($user) {
            Mail::raw(
                "Dear {$user->name},\n\nGreat news! Your project \"{$project->title}\" has been approved by the JNEC Fab Lab admin team.\n\nYour project is now part of our public gallery.\n\nThank you for your contribution!\n\nBest regards,\nJNEC Fab Lab Team",
                function ($message) use ($user, $project) {
                    $message->to($user->email)
                            ->subject("✅ Your Project \"{$project->title}\" Has Been Approved!");
                }
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Project approved successfully.'
        ]);
    }

    /**
     * Reject a project
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string', // Mandatory reason for rejection
        ]);

        $project = Project::findOrFail($id);
        
        $project->update([
            'status' => 'rejected',
            'admin_comments' => $request->reason,
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
        ]);

        // Notify user via database notification
        $project->load('user');
        $project->user->notify(new ProjectStatusNotification($project, 'rejected', $request->reason));

        // In-app notification
        if ($project->user) {
            $project->user->notify(new ProjectStatusNotification($project, 'rejected', $request->reason));
        }

        // ✅ Send Rejection Email with Reason
        $user = User::find($project->user_id);
        if ($user) {
            Mail::raw(
                "Dear {$user->name},\n\nWe have reviewed your project submission \"{$project->title}\".\n\nUnfortunately, it was not approved at this time.\n\nReason: {$request->reason}\n\nYou can edit and resubmit your project after addressing the concerns mentioned above.\n\nIf you have any questions, please contact us.\n\nBest regards,\nJNEC Fab Lab Team",
                function ($message) use ($user, $project) {
                    $message->to($user->email)
                            ->subject("❌ Project Submission Update: \"{$project->title}\"");
                }
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Project rejected successfully.'
        ]);
    }

    /**
     * Delete a project (and its document)
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        
        // Delete the file from storage
        if (Storage::exists($project->document_path)) {
            Storage::delete($project->document_path);
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully.'
        ]);
    }
    /**
 * Bulk delete projects (soft delete)
 */
public function bulkDelete(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'integer|exists:projects,id',
    ]);

    $projects = Project::whereIn('id', $request->ids)->get();

    // Soft delete projects
    foreach ($projects as $project) {
        $project->delete(); // This will use soft delete
    }

    return response()->json([
        'success' => true,
        'message' => count($request->ids) . ' project(s) deleted successfully'
    ]);
}

/**
 * Download project document
 */
public function download($id)
{
    $project = Project::findOrFail($id);
    
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
        return response()->json(['message' => 'File not found'], 404);
    }
    
    return response()->download($filePath, basename($project->document_path));
}
        /**
     * ✅ UPDATED: Preview project document (Smart Preview)
     */
    public function preview($id)
    {
        $project = Project::findOrFail($id);
        
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
            return response()->json(['message' => 'File not found'], 404);
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        // Files that can be previewed directly
        $previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
        $isPreviewable = in_array($extension, $previewableTypes);
        
        // Get file info
        $fileSize = filesize($filePath);
        $fileSizeMB = round($fileSize / 1024 / 1024, 2);
        
        // For text files, read content (only if under 1MB)
        $textContent = null;
        if ($extension === 'txt' && $fileSizeMB < 1) {
            $textContent = file_get_contents($filePath);
        }
        
        return response()->json([
            'success' => true,
            'file_type' => $extension,
            'file_path' => url('storage/' . $project->document_path),
            'file_name' => basename($project->document_path),
            'file_size' => $fileSizeMB,
            'previewable' => $isPreviewable,
            'content' => $textContent,
            'mime_type' => mime_content_type($filePath),
        ]);
    }
}