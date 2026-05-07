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
        'delivery_option',
        'shipping_address',
        'payment_screenshot',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the user who placed the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = static::whereYear('created_at', $year)->latest('id')->first();
        
        $number = $lastOrder ? ((int) substr($lastOrder->order_number, -4) + 1) : 1;
        
        return 'ORD-' . $year . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}