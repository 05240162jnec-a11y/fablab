<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Machine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'status',
        'image',
        'runtime_hours',
        'last_used_at',
        'required_course',  // ✅ FIXED: Singular, matches database column
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'required_course' => 'string',  // ✅ FIXED: It's a string, not array
    ];

    // Helper: Format runtime as "X hrs"
    public function getRuntimeAttribute()
    {
        return $this->runtime_hours . ' hrs';
    }

    // Helper: Format last used as "X hours ago"
    public function getLastUsedAttribute()
    {
        if (!$this->last_used_at) return 'Never';
        
        $diff = $this->last_used_at->diffForHumans();
        return $diff === 'now' ? 'Just now' : $diff;
    }
}