<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'items',
        'total_amount',
        'shipping_cost',
        'delivery_option',
        'shipping_address',
        'payment_screenshot',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = static::whereYear('created_at', $year)->latest('id')->first();
        
        $number = $lastOrder ? ((int) substr($lastOrder->order_number, -4) + 1) : 1;
        
        return 'ORD-' . $year . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function getScreenshotUrlAttribute(): ?string
    {
        return $this->payment_screenshot 
            ? asset('storage/' . $this->payment_screenshot) 
            : null;
    }
}