<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryReceived extends Model
{
    use HasFactory;

    // ✅ Explicitly define the table name (singular)
    protected $table = 'inventory_received';

    protected $fillable = [
        'material_id',
        'name',
        'description',
        'quantity',
        'rate',
        'transaction_date',
        'received_by',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }
}