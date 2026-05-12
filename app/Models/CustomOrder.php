<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomOrder extends Model
{
    protected $fillable = [
        'user_id',
        'assigned_to',
        'title',
        'description',
        'material',
        'quantity',
        'deadline',
        'file_path',
        'notes',
        'status',
        'admin_note',
        'production_note',
        'completed_at',
    ];

    protected $casts = [
        'deadline'     => 'date',
        'completed_at' => 'datetime',
    ];

    // relationship - order belongs to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // relationship - order assigned to production team member
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}