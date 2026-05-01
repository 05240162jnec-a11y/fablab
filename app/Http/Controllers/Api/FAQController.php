<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FAQ;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FAQController extends Controller
{
    /**
     * Get all FAQs
     */
    public function index()
    {
        $faqs = FAQ::orderBy('created_date', 'desc')->get();
        
        // Transform data for frontend
        $transformedFAQs = $faqs->map(function ($faq) {
            return [
                'id' => $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'category' => $faq->category,
                'createdAt' => $faq->created_date->format('Y-m-d'),
            ];
        });
        
        return response()->json([
            'faqs' => $transformedFAQs,
        ]);
    }

    /**
     * Get single FAQ
     */
    public function show($id)
    {
        $faq = FAQ::findOrFail($id);
        
        return response()->json([
            'faq' => [
                'id' => $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'category' => $faq->category,
                'createdAt' => $faq->created_date->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Store a new FAQ
     */
    public function store(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'category' => 'required|string',
        ]);

        $faq = FAQ::create([
            'admin_id' => Auth::guard('admin')->id() ?? 1,
            'question' => $request->question,
            'answer' => $request->answer,
            'category' => $request->category,
            'created_date' => now(),
        ]);

        return response()->json([
            'message' => 'FAQ created successfully!',
            'faq' => [
                'id' => $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'category' => $faq->category,
                'createdAt' => $faq->created_date->format('Y-m-d'),
            ],
        ], 201);
    }

    /**
     * Update FAQ
     */
    public function update(Request $request, $id)
    {
        $faq = FAQ::findOrFail($id);

        $request->validate([
            'question' => 'sometimes|required|string|max:255',
            'answer' => 'sometimes|required|string',
            'category' => 'sometimes|required|string',
        ]);

        $faq->update([
            'question' => $request->question ?? $faq->question,
            'answer' => $request->answer ?? $faq->answer,
            'category' => $request->category ?? $faq->category,
        ]);

        return response()->json([
            'message' => 'FAQ updated successfully!',
            'faq' => [
                'id' => $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'category' => $faq->category,
                'createdAt' => $faq->created_date->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Delete FAQ
     */
    public function destroy($id)
    {
        $faq = FAQ::findOrFail($id);
        $faq->delete();
        
        return response()->json([
            'message' => 'FAQ deleted successfully!',
        ]);
    }
}