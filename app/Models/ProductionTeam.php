<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class ProductionTeam extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $guard = 'production_team';

 protected $table = 'production_teams';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'gender',
        'password',
        'status',
        'assigned_task',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}