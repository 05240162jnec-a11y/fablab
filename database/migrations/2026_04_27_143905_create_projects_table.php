<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            
            // Student who submitted the project
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Project details
            $table->string('student_name');
            $table->string('department');
            $table->string('title');
            $table->text('description');
            
            // Files
            $table->string('pdf_file')->nullable();
            $table->string('video_file')->nullable();
            
            // Status & workflow
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            
            // Dates
            $table->date('submission_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};