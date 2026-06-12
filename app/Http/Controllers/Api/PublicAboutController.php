<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutSection;
use App\Models\TeamMember;

class PublicAboutController extends Controller
{
    public function index()
    {
        $sections = AboutSection::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'section_key' => $section->section_key,
                    'title' => $section->title,
                    'body' => $section->body,
                    'image' => $section->image_path ? asset('storage/' . $section->image_path) : null,
                ];
            });

        $teamMembers = TeamMember::active()
            ->ordered()
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'role' => $member->role,
                    'section' => $member->section,
                    'image' => $member->image_path ? asset('storage/' . $member->image_path) : null,
                    'linkedin_url' => $member->linkedin_url,
                    'facebook_url' => $member->facebook_url,
                    'twitter_url' => $member->twitter_url,
                ];
            });

        return response()->json([
            'success' => true,
            'sections' => $sections,
            'team_members' => $teamMembers,
        ]);
    }
}