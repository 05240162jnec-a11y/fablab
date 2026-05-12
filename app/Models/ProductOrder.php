<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductOrder extends Model
{
    protected $fillable = [
        'user_id',
        'product_name',
        'category',
        'quantity',
        'price',
        'total_price',
        'status',
        'notes',
        'delivery_option',
        'delivery_address',
        'payment_screenshot',
        'payment_status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}