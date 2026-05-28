<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    // Relationship: One Material can have many Received records
    public function receivedRecords()
    {
        return $this->hasMany(InventoryReceived::class, 'material_id');
    }

    // Relationship: One Material can have many Issued records
    public function issuedRecords()
    {
        return $this->hasMany(InventoryIssued::class, 'material_id');
    }
}