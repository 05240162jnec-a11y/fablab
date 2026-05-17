<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            // Progress tracking (0-100%)
            $table->integer('progress')->default(0)->after('status');
            
            // Attendance tracking
            $table->integer('attendance')->default(0)->after('progress');
            $table->integer('total_sessions')->default(0)->after('attendance');
            
            // Certificate tracking
            $table->boolean('certificate_available')->default(false)->after('total_sessions');
            $table->string('certificate_path')->nullable()->after('certificate_available');
            
            // Track when user unenrolled (for "not_started" status)
            $table->timestamp('unenrolled_at')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropColumn([
                'progress',
                'attendance',
                'total_sessions',
                'certificate_available',
                'certificate_path',
                'unenrolled_at',
            ]);
        });
    }
};