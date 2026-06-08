<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role',
        'image_path',
        'linkedin_url',
        'facebook_url',
        'twitter_url',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Scope: Only active members
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope: Order by position
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }
}