<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // DO NOTHING. 
        // This prevents the PostgreSQL "MODIFY" syntax error.
        // The column already exists or is handled elsewhere.
    }

    public function down(): void
    {
        // DO NOTHING.
    }
};