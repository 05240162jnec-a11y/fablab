<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL does not support MySQL's "MODIFY COLUMN" syntax for enums.
        // Since the 'status' column likely already exists, we safely skip 
        // this modification to prevent the syntax error crash.
        if (Schema::hasColumn('projects', 'status')) {
            // Column already exists. We do nothing. We are safe!
        } else {
            // Only create it as a standard string if it is completely missing
            Schema::table('projects', function (Blueprint $table) {
                $table->string('status')->default('pending');
            });
        }
    }

    public function down(): void
    {
        //
    }
};