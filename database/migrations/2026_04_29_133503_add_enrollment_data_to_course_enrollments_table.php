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
        Schema::table('course_enrollments', function (Blueprint $table) {
            // Add JSON snapshot of user's enrollment data
            $table->json('enrollment_data')->nullable()->after('status');
            
            // Add unenrollment tracking
            $table->timestamp('unenrolled_at')->nullable()->after('enrollment_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropColumn(['enrollment_data', 'unenrolled_at']);
        });
    }
};