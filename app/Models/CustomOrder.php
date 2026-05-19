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
        'design_image',        // ✅ Design file path/url
        'status',              // 'pending', 'price_sent', 'paid', 'assigned', 'in_progress', 'completed', 'rejected'
        'estimated_price',
        'rejection_reason',
        'payment_screenshot',
        'payment_verified_at',
        'assigned_to',         // ID of production team member
        'assigned_at',
        'deadline',            // ✅ Ensure this column exists in your migration
    ];

    protected $casts = [
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