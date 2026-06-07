<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the user's custom orders.
     */
    public function customOrders()
    {
        return $this->hasMany(CustomOrder::class, 'user_id');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'gender',
        'phone',
        'role',
        'department',
        'year_of_study',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get all course enrollments for this user
     */
    public function courseEnrollments()
    {
        return $this->hasMany(\App\Models\CourseEnrollment::class, 'user_id');
    }

    /**
     * Get all courses this user is enrolled in (through enrollments table)
     */
    public function courses()
    {
        return $this->belongsToMany(\App\Models\Course::class, 'course_enrollments')
            ->withPivot('status', 'completed_at', 'unenrolled_at')
            ->withTimestamps();
    }

    /**
     * Get the user's completed courses (for training verification)
     */
    public function completedCourses()
    {
        return $this->courses()
            ->wherePivot('status', 'completed');
    }

    /**
     * Check if user has completed any of the required courses for a machine
     * @param array|int $requiredCourses - Array of course IDs or single course ID
     */
    public function hasTrainingForMachine($requiredCourses)
    {
        // Convert single ID to array for consistency
        $courseIds = is_array($requiredCourses) ? $requiredCourses : [$requiredCourses];
        
        if (empty($courseIds)) {
            return true; // No training required
        }

        // Check if user has a COMPLETED enrollment for any of the required courses
        return \App\Models\CourseEnrollment::where('user_id', $this->id)
            ->whereIn('course_id', $courseIds)
            ->where(function ($query) {
                $query->where('status', 'completed')
                      ->orWhere(function ($q) {
                          // Auto-complete if course end date has passed
                          $q->whereNull('unenrolled_at')
                            ->whereHas('course', function ($cq) {
                                $cq->whereColumn('end_date', '<', now());
                            });
                      });
            })
            ->exists();
    }
}