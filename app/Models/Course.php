<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'title',
        'description',
        'instructor',
        'location',
        'duration_weeks',
        'schedule',
        'max_seats',
        'start_date',
        'status',
        'grants_certificate',
    ];

    protected $casts = [
        'grants_certificate' => 'boolean',
        'start_date'         => 'date',
    ];

    // relationship - course has many enrollments
    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    // count enrolled students
    public function enrolledCount()
    {
        return $this->enrollments()->where('status', 'enrolled')->count();
    }
}