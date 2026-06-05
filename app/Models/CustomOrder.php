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
    'order_number',
    'title',
    'description',
    'quantity',
    'design_images',  // ✅ MUST BE HERE!
    'design_image',   // Keep old field for backward compatibility
    'status',
    'estimated_price',
    'price_breakdown',
    'payment_screenshot',
    'payment_verified_at',
    'rejection_reason',
    'deadline',
    'assigned_to',
    'assigned_at',
];

    protected $casts = [
        'design_images' => 'array',
        'estimated_price' => 'decimal:2',
        'quantity' => 'integer',
        'assigned_at' => 'datetime',
        'payment_verified_at' => 'datetime',
        'deadline' => 'date',  // ✅ Cast deadline as date
    ];

    /**
     * Get the user who placed the order (customer).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the assigned production team member.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}