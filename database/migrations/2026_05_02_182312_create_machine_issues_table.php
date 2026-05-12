<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machine_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');    // who reported
            $table->foreignId('machine_id')->constrained()->onDelete('cascade'); // which machine
            $table->string('issue_type');                // type of issue
            $table->text('description');                 // description of issue
            $table->string('severity')->default('low');  // low, medium, high
            $table->string('status')->default('open');   // open, in_progress, resolved
            $table->text('admin_note')->nullable();      // admin response
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machine_issues');
    }
};