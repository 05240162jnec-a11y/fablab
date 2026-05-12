<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MachineIssue extends Model
{
    protected $fillable = [
        'user_id',
        'machine_id',
        'issue_type',
        'description',
        'severity',
        'status',
        'admin_note',
    ];

    // relationship - issue belongs to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // relationship - issue belongs to machine
    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
}