<?php

namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index()
    {
        $products = Product::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'size' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'size' => $request->size,
            'price' => $request->price,
            'stock' => $request->stock,
            'status' => 'active',
        ]);

        // ✅ Handle image uploads (max 5: 1 thumbnail + 4 others)
        if ($request->hasFile('images')) {
            $imagePaths = [];
            $files = is_array($request->images) ? $request->images : [$request->images];
            
            foreach ($files as $index => $image) {
                if ($index >= 5) break;  // ✅ Changed from 4 to 5
                if ($image && $image->isValid()) {
                    $path = $image->store('products', 'public');
                    $imagePaths[] = $path;
                }
            }
            $product->images = $imagePaths;
            $product->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'product' => $product
        ], 201);
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'size' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $product->update([
            'name' => $request->name,
            'description' => $request->description,
            'size' => $request->size,
            'price' => $request->price,
            'stock' => $request->stock,
        ]);

        // ✅ Handle new image uploads (max 5: 1 thumbnail + 4 others)
        if ($request->hasFile('images')) {
            $imagePaths = $product->images ?? [];
            $files = is_array($request->images) ? $request->images : [$request->images];
            
            foreach ($files as $index => $image) {
                if (count($imagePaths) >= 5) break;  // ✅ Changed from 4 to 5
                if ($image && $image->isValid()) {
                    $path = $image->store('products', 'public');
                    $imagePaths[] = $path;
                }
            }
            $product->images = $imagePaths;
            $product->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    /**
     * Toggle product status.
     */
    public function toggleStatus(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
                'errors' => $validator->errors()
            ], 422);
        }

        $product->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'product' => $product
        ]);
    }

    /**
     * Remove a product.
     */
    public function destroy(Product $product)
    {
        if ($product->images && is_array($product->images)) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }
        
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}