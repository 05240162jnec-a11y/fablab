<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Machine extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'status',
        'requires_training',
        'image',
        'max_booking_hours',
        'is_active',
    ];

    protected $casts = [
        'requires_training' => 'boolean',
        'is_active'         => 'boolean',
    ];

    // relationship - machine has many bookings
    public function bookings()
    {
        return $this->hasMany(MachineBooking::class);
    }
}