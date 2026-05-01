<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('instructor');
            $table->string('duration');
            $table->string('schedule');
            $table->integer('seat_limit');
            $table->integer('enrollment')->default(0);
            $table->string('status')->default('upcoming'); // upcoming, active, completed
            $table->string('registration_status')->default('open'); // open, closed
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};