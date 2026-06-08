<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    /**
     * Get all gallery images
     */
    public function index()
    {
        $galleries = Gallery::orderBy('uploaded_date', 'desc')->get();
        
        // Transform data for frontend - ✅ REMOVED category
        $transformedGalleries = $galleries->map(function ($gallery) {
            return [
                'id' => $gallery->id,
                'title' => $gallery->title,
                'description' => $gallery->description,
                'image' => asset('storage/' . $gallery->image_path),
                'uploadedBy' => $gallery->uploaded_by,
                'uploadedAt' => $gallery->uploaded_date->format('Y-m-d'),
            ];
        });
        
        return response()->json([
            'galleries' => $transformedGalleries,
        ]);
    }

    /**
     * Get single gallery image
     */
    public function show($id)
    {
        $gallery = Gallery::findOrFail($id);
        
        return response()->json([
            'gallery' => [
                'id' => $gallery->id,
                'title' => $gallery->title,
                'description' => $gallery->description,
                'image' => asset('storage/' . $gallery->image_path),
                'uploadedBy' => $gallery->uploaded_by,
                'uploadedAt' => $gallery->uploaded_date->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Store a new gallery image - ✅ REMOVED category validation
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('galleries', $imageName, 'public');

            $gallery = Gallery::create([
                'admin_id' => Auth::guard('admin')->id() ?? 1,
                'title' => $request->title,
                'image_path' => $imagePath,
                'description' => $request->description,
                'file_name' => $imageName,
                'file_size' => $this->formatFileSize($image->getSize()),
                'mime_type' => $image->getMimeType(),
                'uploaded_by' => 'Admin User',
                'uploaded_date' => now(),
            ]);

            return response()->json([
                'message' => 'Image uploaded successfully!',
                'gallery' => [
                    'id' => $gallery->id,
                    'title' => $gallery->title,
                    'description' => $gallery->description,
                    'image' => asset('storage/' . $gallery->image_path),
                    'uploadedBy' => $gallery->uploaded_by,
                    'uploadedAt' => $gallery->uploaded_date->format('Y-m-d'),
                ],
            ], 201);
        }

        return response()->json([
            'message' => 'No image file provided',
        ], 422);
    }

    /**
     * Update gallery image - ✅ REMOVED category
     */
    public function update(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $gallery->update([
            'title' => $request->title ?? $gallery->title,
            'description' => $request->description ?? $gallery->description,
        ]);

        return response()->json([
            'message' => 'Gallery updated successfully!',
            'gallery' => $gallery,
        ]);
    }

    /**
     * Delete gallery image
     */
    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);
        
        // Delete image file
        if (Storage::disk('public')->exists($gallery->image_path)) {
            Storage::disk('public')->delete($gallery->image_path);
        }
        
        $gallery->delete();
        
        return response()->json([
            'message' => 'Image deleted successfully!',
        ]);
    }

    /**
     * Format file size
     */
    private function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}