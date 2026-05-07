<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            // Add missing columns that controller expects
            
            if (!Schema::hasColumn('product_orders', 'total_amount')) {
                $table->decimal('total_amount', 10, 2)->after('items');
            }
            
            if (!Schema::hasColumn('product_orders', 'delivery_option')) {
                $table->enum('delivery_option', ['pickup', 'shipping'])->after('total_amount');
            }
            
            if (!Schema::hasColumn('product_orders', 'shipping_address')) {
                $table->text('shipping_address')->nullable()->after('delivery_option');
            }
            
            if (!Schema::hasColumn('product_orders', 'payment_screenshot')) {
                $table->string('payment_screenshot')->nullable()->after('shipping_address');
            }
            
            // Remove unexpected columns (optional - comment out if you want to keep them)
            // $table->dropColumn(['name', 'quantity', 'order_date', 'image']);
        });
    }

    public function down(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn(['total_amount', 'delivery_option', 'shipping_address', 'payment_screenshot']);
        });
    }
};