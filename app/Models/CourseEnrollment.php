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
        'enrollment_data',      // ✅ ADD THIS
        'unenrolled_at',        // ✅ ADD THIS
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'enrollment_data' => 'array',  // ✅ ADD THIS
        'unenrolled_at' => 'datetime', // ✅ ADD THIS
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
    public function isActive()
    {
        return is_null($this->unenrolled_at);
    }

    /**
     * Check if enrollment is completed
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }
}