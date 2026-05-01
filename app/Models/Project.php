<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_name',
        'department',
        'title',
        'description',
        'pdf_file',
        'video_file',
        'status',
        'rejection_reason',
        'submission_date',
    ];

    protected $casts = [
        'submission_date' => 'date',
    ];

    // Relationship: Project belongs to a User (student)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}