<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    // submit feedback - user
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'rating'   => 'required|integer|min:1|max:5',
            'comment'  => 'required|string',
        ]);

        $feedback = Feedback::create([
            'user_id'  => $request->user()->id,
            'category' => $request->category,
            'rating'   => $request->rating,
            'comment'  => $request->comment,
            'status'   => 'pending',
        ]);

        return response()->json([
            'message'  => 'Feedback submitted successfully. Thank you!',
            'feedback' => $feedback,
        ], 201);
    }

    // get user feedbacks
    public function userFeedbacks(Request $request)
    {
        $feedbacks = Feedback::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($feedbacks);
    }

    // get all feedbacks - admin
    public function adminFeedbacks()
    {
        $feedbacks = Feedback::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($feedbacks);
    }

    // mark feedback as reviewed - admin
    public function markReviewed($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->status = 'reviewed';
        $feedback->save();

        return response()->json([
            'message' => 'Feedback marked as reviewed',
        ]);
    }
}