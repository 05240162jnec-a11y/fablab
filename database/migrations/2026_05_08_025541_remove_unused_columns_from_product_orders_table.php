<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            // Drop columns that don't belong in product_orders table
            $table->dropColumn(['name', 'quantity', 'order_date', 'image']);
        });
    }

    public function down(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            // Add them back if we rollback (optional)
            $table->string('name');
            $table->integer('quantity');
            $table->date('order_date');
            $table->string('image')->nullable();
        });
    }
};