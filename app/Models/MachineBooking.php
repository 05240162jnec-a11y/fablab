<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MachineBooking extends Model
{
    protected $fillable = [
        'user_id',
        'machine_id',
        'booking_date',
        'start_time',
        'end_time',
        'status',
        'purpose',
        'admin_note',
        'certificate_verified',
    ];

    protected $casts = [
        'certificate_verified' => 'boolean',
        'booking_date'         => 'date',
    ];

    // relationship - booking belongs to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // relationship - booking belongs to machine
    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
}