<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomOrder extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'title',
        'description',
        'material',
        'color',
        'dimensions',
        'quantity',
        'deadline',
        'status',
        'rejection_reason',
        'image',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}