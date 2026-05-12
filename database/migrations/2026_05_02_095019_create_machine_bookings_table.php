<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machine_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');       // who booked
            $table->foreignId('machine_id')->constrained()->onDelete('cascade');    // which machine
            $table->date('booking_date');                                           // date of booking
            $table->string('start_time');                                           // start time e.g 09:00
            $table->string('end_time');                                             // end time e.g 11:00
            $table->string('status')->default('pending');                           // pending, approved, rejected, completed
            $table->text('purpose')->nullable();                                    // purpose of booking
            $table->text('admin_note')->nullable();                                 // note from admin
            $table->boolean('certificate_verified')->default(false);               // certificate verified
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machine_bookings');
    }
};