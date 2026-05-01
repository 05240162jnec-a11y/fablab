<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'name',
        'quantity',
        'order_date',
        'status',
        'image',
        'rejection_reason',
    ];

    protected $casts = [
        'order_date' => 'date',
    ];

    // Relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}