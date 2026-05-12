<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MachineIssue;
use App\Models\Machine;
use Illuminate\Http\Request;

class MachineIssueController extends Controller
{
    // report a machine issue - user
    public function store(Request $request)
    {
        $request->validate([
            'machine_id'  => 'required|integer',
            'issue_type'  => 'required|string',
            'description' => 'required|string',
            'severity'    => 'required|string|in:low,medium,high',
        ]);

        $issue = MachineIssue::create([
            'user_id'     => $request->user()->id,
            'machine_id'  => $request->machine_id,
            'issue_type'  => $request->issue_type,
            'description' => $request->description,
            'severity'    => $request->severity,
            'status'      => 'open',
        ]);

        // if high severity update machine status to faulty
        if ($request->severity === 'high') {
            $machine = Machine::findOrFail($request->machine_id);
            $machine->status = 'faulty';
            $machine->save();
        }

        return response()->json([
            'message' => 'Issue reported successfully. Admin will review it soon.',
            'issue'   => $issue,
        ], 201);
    }

    // get user reported issues
    public function userIssues(Request $request)
    {
        $issues = MachineIssue::with('machine')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($issues);
    }

    // get all issues - admin
    public function adminIssues()
    {
        $issues = MachineIssue::with(['user', 'machine'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($issues);
    }

    // update issue status - admin
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'     => 'required|string|in:open,in_progress,resolved',
            'admin_note' => 'nullable|string',
        ]);

        $issue = MachineIssue::findOrFail($id);
        $issue->status     = $request->status;
        $issue->admin_note = $request->admin_note;
        $issue->save();

        // if resolved update machine status back to available
        if ($request->status === 'resolved') {
            $machine = Machine::findOrFail($issue->machine_id);
            $machine->status = 'available';
            $machine->save();
        }

        return response()->json([
            'message' => 'Issue status updated successfully',
            'issue'   => $issue,
        ]);
    }
}