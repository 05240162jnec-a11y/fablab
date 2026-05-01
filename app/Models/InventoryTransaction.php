<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_id',
        'type',
        'quantity',
        'rate',
        'transaction_date',
        'reason',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'quantity' => 'integer',
        'transaction_date' => 'date',
    ];

    // Relationship
    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}