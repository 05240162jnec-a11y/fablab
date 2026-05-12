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
            $table->string('title');                         // course title
            $table->text('description')->nullable();          // description
            $table->string('instructor');                     // instructor name
            $table->string('location')->nullable();           // location
            $table->integer('duration_weeks');                // duration in weeks
            $table->string('schedule')->nullable();           // e.g Mon & Wed 10:00-11:30
            $table->integer('max_seats');                     // max students
            $table->date('start_date');                       // start date
            $table->string('status')->default('active');      // active, completed, cancelled
            $table->boolean('grants_certificate')->default(true); // gives training certificate
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};