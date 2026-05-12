<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');    // who enrolled
            $table->foreignId('course_id')->constrained()->onDelete('cascade');  // which course
            $table->string('status')->default('enrolled');   // enrolled, completed, cancelled
            $table->boolean('certificate_issued')->default(false); // certificate issued
            $table->timestamp('completed_at')->nullable();   // when completed
            $table->text('admin_note')->nullable();          // note from admin
            $table->timestamps();

            // prevent duplicate enrollments
            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
    }
};