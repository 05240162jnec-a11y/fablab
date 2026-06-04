<?php

namespace App\Http\Controllers\Api\ProductionTeam;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    /**
     * Get all project submissions (for production team)
     */
    public function index()
{
    $projects = Project::with(['user', 'reviewer'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($project) {
            // If reviewer doesn't exist in users table, provide fallback
            $reviewer = null;
            if ($project->reviewer) {
                $reviewer = [
                    'id' => $project->reviewer->id,
                    'name' => $project->reviewer->name,
                    'email' => $project->reviewer->email,
                ];
            } elseif ($project->reviewed_by) {
                // Try to find in users table with a direct query
                $user = \App\Models\User::find($project->reviewed_by);
                if ($user) {
                    $reviewer = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                } else {
                    // Reviewer doesn't exist - mark as "Admin" or "Unknown"
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

    // Calculate stats
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

        // ✅ Send Approval Email
        $user = User::find($project->user_id);
        if ($user) {
            Mail::raw(
                "Dear {$user->name},\n\nGreat news! Your project \"{$project->title}\" has been approved by the JNEC Fab Lab production team.\n\nYour project is now part of our public gallery.\n\nThank you for your contribution!\n\nBest regards,\nJNEC Fab Lab Team",
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
            'reason' => 'required|string',
        ]);

        $project = Project::findOrFail($id);
        
        $project->update([
            'status' => 'rejected',
            'admin_comments' => $request->reason,
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
        ]);

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
     * Delete a project (soft delete)
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete(); // Soft delete

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

        foreach ($projects as $project) {
            $project->delete(); // Soft delete
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
}