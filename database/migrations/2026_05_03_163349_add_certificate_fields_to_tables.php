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
        // ✅ Add certificate_template_path to courses table
        Schema::table('courses', function (Blueprint $table) {
            $table->string('certificate_template_path')->nullable()->after('image');
        });
        
        // ✅ Add certificate fields to course_enrollments table
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->string('certificate_id')->nullable()->unique()->after('status');
            $table->timestamp('certificate_generated_at')->nullable()->after('certificate_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove from courses table
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('certificate_template_path');
        });
        
        // Remove from course_enrollments table
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropColumn(['certificate_id', 'certificate_generated_at']);
        });
    }
};