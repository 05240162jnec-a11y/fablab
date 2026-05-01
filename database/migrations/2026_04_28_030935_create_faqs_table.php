<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            
            // Admin who created the FAQ
            $table->foreignId('admin_id')->constrained('admins')->onDelete('cascade');
            
            // FAQ content
            $table->string('question');
            $table->text('answer');
            $table->string('category')->default('General');
            
            // Metadata
            $table->date('created_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};