<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\CourseEnrollment;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
	use HasApiTokens, HasFactory, Notifiable;

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
        ];
    }
/**
 * Get the user's course enrollments
 */
public function courses()
{
    return $this->hasMany(CourseEnrollment::class);
}

/**
 * Get the user's completed courses (for training verification)
 */
public function completedCourses()
{
    return $this->courses()->where('status', 'completed');
}

/**
 * Check if user has completed any of the required courses for a machine
 */
public function hasTrainingForMachine($requiredCourses)
{
    if (empty($requiredCourses)) {
        return true; // No training required
    }

    return $this->courses()
        ->where('status', 'completed')
        ->whereHas('course', function ($query) use ($requiredCourses) {
            $query->whereIn('title', $requiredCourses);
        })
        ->exists();
}
}
