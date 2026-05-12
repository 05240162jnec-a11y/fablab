<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseEnrollment extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'status',
        'certificate_issued',
        'completed_at',
        'admin_note',
    ];

    protected $casts = [
        'certificate_issued' => 'boolean',
        'completed_at'       => 'datetime',
    ];

    // relationship - enrollment belongs to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // relationship - enrollment belongs to course
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}