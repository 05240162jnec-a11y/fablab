<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // get all available products - public
    public function index()
    {
        $products = Product::where('is_available', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) {
                $product->image_url = $product->image
                    ? asset('storage/' . $product->image)
                    : null;
                return $product;
            });

        return response()->json($products);
    }

    // get all products for admin
    public function adminIndex()
    {
        $products = Product::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) {
                $product->image_url = $product->image
                    ? asset('storage/' . $product->image)
                    : null;
                return $product;
            });

        return response()->json($products);
    }

    // add new product - admin only
    public function store(Request $request)
    {
        $request->validate([
            'name'         => 'required|string',
            'category'     => 'required|string',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric',
            'stock'        => 'required|integer',
            'unit'         => 'nullable|string',
            'is_available' => 'boolean',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name'         => $request->name,
            'category'     => $request->category,
            'description'  => $request->description,
            'price'        => $request->price,
            'stock'        => $request->stock,
            'unit'         => $request->unit ?? 'piece',
            'is_available' => $request->is_available ?? true,
            'image'        => $imagePath,
        ]);

        $product->image_url = $imagePath ? asset('storage/' . $imagePath) : null;

        return response()->json([
            'message' => 'Product added successfully',
            'product' => $product,
        ], 201);
    }

    // update product - admin only
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $imagePath = $product->image;
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product->update([
            'name'         => $request->name ?? $product->name,
            'category'     => $request->category ?? $product->category,
            'description'  => $request->description ?? $product->description,
            'price'        => $request->price ?? $product->price,
            'stock'        => $request->stock ?? $product->stock,
            'unit'         => $request->unit ?? $product->unit,
            'is_available' => $request->is_available ?? $product->is_available,
            'image'        => $imagePath,
        ]);

        $product->image_url = $imagePath ? asset('storage/' . $imagePath) : null;

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    // delete product - admin only
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}