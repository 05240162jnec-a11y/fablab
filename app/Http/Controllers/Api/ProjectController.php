<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with('user:id,name')
            ->where('status', 'approved')
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'nullable|string|max:100',
            'file'        => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip|max:20480',
            'video_url'   => 'nullable|url|max:500',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('projects', 'public');
        }

        $project = Project::create([
            'user_id'     => $request->user()->id,
            'title'       => $request->title,
            'description' => $request->description,
            'category'    => $request->category,
            'file_path'   => $filePath,
            'video_url'   => $request->video_url,
            'status'      => 'pending',
        ]);

        return response()->json($project, 201);
    }

    public function userProjects(Request $request)
    {
        $projects = Project::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($projects);
    }

    public function destroy(Request $request, $id)
    {
        $project = Project::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($project->file_path) {
            Storage::disk('public')->delete($project->file_path);
        }

        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }

    public function adminProjects()
    {
        $projects = Project::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                if ($project->file_path) {
                    $project->file_url = asset('storage/' . $project->file_path);
                }
                return $project;
            });
        return response()->json($projects);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'      => 'required|in:pending,approved,rejected',
            'admin_note'  => 'nullable|string',
            'is_featured' => 'nullable|boolean',
        ]);

        $project = Project::findOrFail($id);
        $project->update([
            'status'      => $request->status,
            'admin_note'  => $request->admin_note,
            'is_featured' => $request->is_featured ?? $project->is_featured,
        ]);

        return response()->json($project);
    }
}