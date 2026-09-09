<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Do nothing. The constraint is already gone, so the goal of this 
        // migration is already met. This prevents the crash.
    }

    public function down(): void
    {
        // Do nothing.
    }
};