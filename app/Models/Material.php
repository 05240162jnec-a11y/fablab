<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'quantity',
        'rate',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'quantity' => 'integer',
    ];

    // ← ADD THIS: Include accessors in JSON response
    protected $appends = ['received', 'issued'];

    // Relationship
    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    // Helper: Get total received quantity
    public function getReceivedAttribute()
    {
        return $this->transactions()
            ->where('type', 'received')
            ->sum('quantity');
    }

    // Helper: Get total issued quantity  
    public function getIssuedAttribute()
    {
        return $this->transactions()
            ->where('type', 'issued')
            ->sum('quantity');
    }
}