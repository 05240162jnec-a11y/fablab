<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'title',
        'image_path',
        // ✅ REMOVED: 'category',
        'description',
        'file_name',
        'file_size',
        'mime_type',
        'uploaded_by',
        'uploaded_date',
    ];

    protected $casts = [
        'uploaded_date' => 'date',
    ];

    // Relationship: Gallery belongs to an Admin
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}