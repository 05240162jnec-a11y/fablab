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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');                          // project title
            $table->text('description');                      // project description
            $table->string('category')->nullable();           // category
            $table->string('file_path')->nullable();          // uploaded file
            $table->string('video_url')->nullable();          // video link
            $table->string('status')->default('pending');     // pending, approved, rejected
            $table->text('admin_note')->nullable();           // admin feedback
            $table->boolean('is_featured')->default(false);  // featured on landing page
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};