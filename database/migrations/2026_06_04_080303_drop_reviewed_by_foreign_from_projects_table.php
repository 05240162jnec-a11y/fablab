<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['reviewed_by']);
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Re-add if needed (optional)
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
        });
    }
};