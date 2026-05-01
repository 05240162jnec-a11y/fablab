<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Add course schedule dates
            $table->date('start_date')->nullable()->after('duration');
            $table->date('end_date')->nullable()->after('start_date');
            
            // Add registration status
            $table->boolean('registration_open')->default(true)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date', 'registration_open']);
        });
    }
};