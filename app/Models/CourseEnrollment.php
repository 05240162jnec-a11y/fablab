<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseEnrollment extends Model
{
    use HasFactory;

    protected $table = 'course_enrollments';

    protected $fillable = [
        'user_id',
        'course_id',
        'status',
        'completed_at',
        'enrollment_data',
        'unenrolled_at',
        // ✅ NEW FIELDS for tracking
        'progress',
        'attendance',
        'total_sessions',
        'certificate_available',
        'certificate_path',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'enrollment_data' => 'array',
        'unenrolled_at' => 'datetime',
        'progress' => 'integer',
        'attendance' => 'integer',
        'total_sessions' => 'integer',
        'certificate_available' => 'boolean',
    ];

    /**
     * Get the user who enrolled
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course that was enrolled in
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Check if enrollment is active (not unenrolled)
     */
    public function isActive(): bool
    {
        return is_null($this->unenrolled_at) && $this->status === 'enrolled';
    }

    /**
     * Check if enrollment is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' || $this->certificate_available === true;
    }

    /**
     * Get enrollment status for frontend
     */
    public function getFrontendStatusAttribute(): string
    {
        if ($this->unenrolled_at) {
            return 'not_started';
        }
        if ($this->status === 'completed' || $this->certificate_available) {
            return 'completed';
        }
        return 'active';
    }
}