<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FAQ extends Model
{
    use HasFactory;

    protected $table = 'faqs';

    protected $fillable = [
        'admin_id',
        'question',
        'answer',
        'category',
        'created_date',
    ];

    protected $casts = [
        'created_date' => 'date',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}