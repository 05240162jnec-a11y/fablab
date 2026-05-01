<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryStock extends Model
{
    protected $fillable = [
        'item_id',
        'current_stock',
        'total_received',
        'total_issued',
        'last_updated',
    ];

    protected $casts = [
        'last_updated' => 'datetime',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    // Auto-update last_updated when stock changes
    public function updateStock($newStock, $received = 0, $issued = 0)
    {
        $this->update([
            'current_stock' => $newStock,
            'total_received' => $this->total_received + $received,
            'total_issued' => $this->total_issued + $issued,
            'last_updated' => now(),
        ]);
    }
}