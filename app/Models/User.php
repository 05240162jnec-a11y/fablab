<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // columns that can be filled
    protected $fillable = [
        'name',
        'cid',
        'gender',
        'phone',
        'account_type',
        'email',
        'password',
        'role',
        'is_trained',
    ];

    // columns that are hidden from response
    protected $hidden = [
        'password', // never show password
    ];

    // columns data type
    protected $casts = [
        'is_trained' => 'boolean', // true or false
    ];
}
