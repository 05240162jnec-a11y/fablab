<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutSection;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AboutController extends Controller
{
    // ═══════════════════════════════════════════════
    // ABOUT SECTIONS MANAGEMENT
    // ═══════════════════════════════════════════════

    /**
     * Get all about sections
     */
    public function getSections()
    {
        $sections = AboutSection::orderBy('order')->get();

        return response()->json([
            'success' => true,
            'sections' => $sections->map(function ($section) {
                return [
                    'id' => $section->id,
                    'section_key' => $section->section_key,
                    'title' => $section->title,
                    'body' => $section->body,
                    'image' => $section->image_path ? asset('storage/' . $section->image_path) : null,
                    'order' => $section->order,
                    'is_active' => $section->is_active,
                ];
            }),
        ]);
    }

    /**
     * Update about section
     */
    public function updateSection(Request $request, $id)
    {
        $section = AboutSection::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $updateData = [
            'title' => $request->title,
            'body' => $request->body,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($section->image_path && Storage::disk('public')->exists($section->image_path)) {
                Storage::disk('public')->delete($section->image_path);
            }

            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('about', $imageName, 'public');
            $updateData['image_path'] = $imagePath;
        }

        $section->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Section updated successfully!',
            'section' => [
                'id' => $section->id,
                'section_key' => $section->section_key,
                'title' => $section->title,
                'body' => $section->body,
                'image' => $section->image_path ? asset('storage/' . $section->image_path) : null,
            ],
        ]);
    }

    // ═══════════════════════════════════════════════
    // TEAM MEMBERS MANAGEMENT
    // ═══════════════════════════════════════════════

    /**
     * Get all team members
     */
    public function getTeamMembers()
    {
        $members = TeamMember::orderBy('order')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'members' => $members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'role' => $member->role,
                    'image' => $member->image_path ? asset('storage/' . $member->image_path) : null,
                    'linkedin_url' => $member->linkedin_url,
                    'facebook_url' => $member->facebook_url,
                    'twitter_url' => $member->twitter_url,
                    'order' => $member->order,
                    'is_active' => $member->is_active,
                ];
            }),
        ]);
    }

    /**
     * Store new team member
     */
    public function storeTeamMember(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'linkedin_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('team', $imageName, 'public');
        }

        $member = TeamMember::create([
            'name' => $request->name,
            'role' => $request->role,
            'image_path' => $imagePath,
            'linkedin_url' => $request->linkedin_url,
            'facebook_url' => $request->facebook_url,
            'twitter_url' => $request->twitter_url,
            'order' => $request->order ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Team member added successfully!',
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'role' => $member->role,
                'image' => $member->image_path ? asset('storage/' . $member->image_path) : null,
                'linkedin_url' => $member->linkedin_url,
                'facebook_url' => $member->facebook_url,
                'twitter_url' => $member->twitter_url,
            ],
        ], 201);
    }

    /**
     * Update team member
     */
    public function updateTeamMember(Request $request, $id)
    {
        $member = TeamMember::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'linkedin_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
        ]);

        $updateData = [
            'name' => $request->name,
            'role' => $request->role,
            'linkedin_url' => $request->linkedin_url,
            'facebook_url' => $request->facebook_url,
            'twitter_url' => $request->twitter_url,
            'order' => $request->order ?? $member->order,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($member->image_path && Storage::disk('public')->exists($member->image_path)) {
                Storage::disk('public')->delete($member->image_path);
            }

            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('team', $imageName, 'public');
            $updateData['image_path'] = $imagePath;
        }

        $member->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Team member updated successfully!',
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'role' => $member->role,
                'image' => $member->image_path ? asset('storage/' . $member->image_path) : null,
                'linkedin_url' => $member->linkedin_url,
                'facebook_url' => $member->facebook_url,
                'twitter_url' => $member->twitter_url,
            ],
        ]);
    }

    /**
     * Toggle team member active status
     */
    public function toggleTeamMemberStatus($id)
    {
        $member = TeamMember::findOrFail($id);
        $member->update(['is_active' => !$member->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully!',
            'is_active' => $member->is_active,
        ]);
    }

    /**
     * Delete team member
     */
    public function destroyTeamMember($id)
    {
        $member = TeamMember::findOrFail($id);

        // Delete image file
        if ($member->image_path && Storage::disk('public')->exists($member->image_path)) {
            Storage::disk('public')->delete($member->image_path);
        }

        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Team member deleted successfully!',
        ]);
    }
}