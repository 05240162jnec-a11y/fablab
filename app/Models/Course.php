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
    'duration',
    'start_date',
    'end_date',
    'schedule',
    'seat_limit',
    'enrollment',
    'status',
    'registration_open',
    'registration_status',
    'description',
    'image',
    'certificate_template_path',  
];

    protected $casts = [
        'start_date' => 'date',           // ✅ ADD THIS
        'end_date' => 'date',             // ✅ ADD THIS
        'registration_open' => 'boolean', // ✅ ADD THIS
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