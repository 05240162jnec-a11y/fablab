<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryIssued extends Model
{
    use HasFactory;

    // ✅ Explicitly define the table name (singular)
    protected $table = 'inventory_issued';

    protected $fillable = [
        'material_id',
        'name',
        'quantity',
        'transaction_date',
        'issued_to',
        'reason',
        'issued_by',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }
}