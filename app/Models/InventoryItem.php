<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InventoryItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'unit',
        'standard_rate',
        'description',
        'low_stock_threshold',
        'is_active',
    ];

    protected $casts = [
        'standard_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function stock(): HasOne
    {
        return $this->hasOne(InventoryStock::class);
    }

    // Helper: Get current stock
    public function getCurrentStockAttribute()
    {
        return $this->stock?->current_stock ?? 0;
    }

    // Helper: Check if low stock
    public function getIsLowStockAttribute()
    {
        return $this->current_stock < $this->low_stock_threshold;
    }
}