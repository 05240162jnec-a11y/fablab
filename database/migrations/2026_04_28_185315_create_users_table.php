<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');                             // full name
            $table->string('cid')->nullable();                  // citizenship ID
            $table->string('gender')->nullable();               // gender
            $table->string('phone')->nullable();                // phone number
            $table->string('account_type')->default('student'); // student, staff, external
            $table->string('email')->unique();                  // email
            $table->string('password');                         // encrypted password
            $table->string('role')->default('user');            // user, admin, super_admin, production_team
            $table->boolean('is_trained')->default(false);      // training completed or not
            $table->timestamps();                               // created_at and updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};