<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // Make order_number nullable
            $table->string('order_number')->nullable()->change();
            
            // Remove unused columns (optional)
            $table->dropColumn(['material', 'color', 'dimensions', 'deadline']);
        });
    }

    public function down()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            $table->string('order_number')->nullable(false)->change();
            $table->string('material')->nullable();
            $table->string('color')->nullable();
            $table->string('dimensions')->nullable();
            $table->date('deadline')->nullable();
        });
    }
};