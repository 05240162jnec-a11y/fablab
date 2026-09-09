<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // Add assigned_to column ONLY if it doesn't already exist
            if (!Schema::hasColumn('custom_orders', 'assigned_to')) {
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            }
            
            // Add assigned_at column ONLY if it doesn't already exist
            if (!Schema::hasColumn('custom_orders', 'assigned_at')) {
                $table->timestamp('assigned_at')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // Safely drop foreign key and columns if they exist
            if (Schema::hasColumn('custom_orders', 'assigned_to')) {
                $table->dropForeign(['assigned_to']);
                $table->dropColumn('assigned_to');
            }
            
            if (Schema::hasColumn('custom_orders', 'assigned_at')) {
                $table->dropColumn('assigned_at');
            }
        });
    }
};