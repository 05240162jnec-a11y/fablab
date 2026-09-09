<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // Make order_number nullable (ONLY if the column exists)
            if (Schema::hasColumn('custom_orders', 'order_number')) {
                $table->string('order_number')->nullable()->change();
            }
            
            // Remove unused columns (ONLY if they exist)
            if (Schema::hasColumn('custom_orders', 'material')) {
                $table->dropColumn('material');
            }
            if (Schema::hasColumn('custom_orders', 'color')) {
                $table->dropColumn('color');
            }
            if (Schema::hasColumn('custom_orders', 'dimensions')) {
                $table->dropColumn('dimensions');
            }
            if (Schema::hasColumn('custom_orders', 'deadline')) {
                $table->dropColumn('deadline');
            }
        });
    }

    public function down()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // Reverse the changes (ONLY if columns exist)
            if (Schema::hasColumn('custom_orders', 'order_number')) {
                $table->string('order_number')->nullable(false)->change();
            }
            if (Schema::hasColumn('custom_orders', 'material')) {
                $table->string('material')->nullable();
            }
            if (Schema::hasColumn('custom_orders', 'color')) {
                $table->string('color')->nullable();
            }
            if (Schema::hasColumn('custom_orders', 'dimensions')) {
                $table->string('dimensions')->nullable();
            }
            if (Schema::hasColumn('custom_orders', 'deadline')) {
                $table->date('deadline')->nullable();
            }
        });
    }
};