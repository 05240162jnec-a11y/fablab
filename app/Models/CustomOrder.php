<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'quantity',
        'design_image',
        'status',
        'estimated_price',
        'rejection_reason',
        'assigned_to',
        'assigned_at',
    ];

    protected $casts = [
        'estimated_price' => 'decimal:2',
        'quantity' => 'integer',
        'assigned_at' => 'datetime',
    ];

    /**
     * Get the user who placed the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the assigned production team member.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}