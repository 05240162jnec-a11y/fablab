<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Safely attempt to drop the foreign key. 
            // If it doesn't exist, the catch block prevents the migration from crashing.
            try {
                $table->dropForeign(['reviewed_by']);
            } catch (\Exception $e) {
                // Constraint doesn't exist, which is fine. We just continue.
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Only add it back if the column actually exists
            if (Schema::hasColumn('projects', 'reviewed_by')) {
                $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }
};