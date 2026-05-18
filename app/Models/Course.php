<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'instructor',
        // ❌ REMOVED: 'duration',
        'start_date',
        'end_date',
        // ❌ REMOVED: 'schedule',
        'seat_limit',
        'enrollment',
        'status',
        'registration_open',
        'registration_status',
        'description',
        'image',
        // ❌ REMOVED: 'certificate_template_path',
        // ❌ REMOVED: 'certificate_template_config',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'registration_open' => 'boolean',
        // ❌ REMOVED: 'certificate_template_config' => 'array',
    ];

    // Helper: Check if course is currently running
    public function isOngoing()
    {
        if (!$this->start_date || !$this->end_date) return false;
        
        $today = now()->startOfDay();
        return $today->between($this->start_date, $this->end_date);
    }

    // Helper: Check if registration is open
    public function canEnroll()
    {
        return $this->registration_open && $this->enrollment < $this->seat_limit;
    }

    // Helper: Get available seats
    public function getAvailableSeatsAttribute()
    {
        return max(0, $this->seat_limit - $this->enrollment);
    }
}