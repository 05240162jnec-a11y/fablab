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
            $table->string('name');
            $table->string('type'); // 3D Printing, Laser Cutting, CNC Machining, etc.
            $table->text('description')->nullable();
            $table->string('status')->default('available'); // available, in-use, maintenance
            $table->string('image')->nullable();
            $table->integer('runtime_hours')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};