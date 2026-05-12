<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->string('delivery_option')->default('pickup')->after('notes');
            $table->string('delivery_address')->nullable()->after('delivery_option');
            $table->string('payment_screenshot')->nullable()->after('delivery_address');
        });
    }

    public function down(): void {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_option', 'delivery_address', 'payment_screenshot']);
        });
    }
};