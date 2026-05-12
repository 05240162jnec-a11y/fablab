<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'file_path',
        'video_url',
        'status',
        'admin_note',
        'is_featured',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}