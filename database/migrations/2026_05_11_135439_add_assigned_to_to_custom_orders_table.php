<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // Add assigned_to column for production team assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('assigned_at')->nullable();
        });
    }

    public function down()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn(['assigned_to', 'assigned_at']);
        });
    }
};