<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->string('name');                              // machine name
            $table->string('category');                          // category
            $table->text('description')->nullable();             // description
            $table->string('status')->default('available');      // available, maintenance, faulty
            $table->boolean('requires_training')->default(true); // requires certificate
            $table->string('image')->nullable();                 // machine image
            $table->integer('max_booking_hours')->default(2);    // max hours per booking
            $table->boolean('is_active')->default(true);         // active or not
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};