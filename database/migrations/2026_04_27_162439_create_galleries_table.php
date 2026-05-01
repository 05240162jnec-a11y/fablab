<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            
            // Admin who uploaded (using admins table)
            $table->foreignId('admin_id')->constrained('admins')->onDelete('cascade');
            
            // Image details
            $table->string('title');
            $table->string('image_path');
            $table->string('category')->default('3D Printing');
            $table->text('description')->nullable();
            
            // File info
            $table->string('file_name');
            $table->string('file_size')->nullable();
            $table->string('mime_type')->nullable();
            
            // Metadata
            $table->string('uploaded_by');
            $table->date('uploaded_date');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};