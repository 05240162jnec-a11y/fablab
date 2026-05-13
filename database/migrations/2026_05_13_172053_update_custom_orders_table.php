<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // ✅ Add estimated_price column (nullable - null until admin sets it)
            if (!Schema::hasColumn('custom_orders', 'estimated_price')) {
                $table->decimal('estimated_price', 10, 2)->nullable()->after('description');
            }
            
            // ✅ Add payment_screenshot column (stores uploaded image path)
            if (!Schema::hasColumn('custom_orders', 'payment_screenshot')) {
                $table->string('payment_screenshot')->nullable()->after('estimated_price');
            }
            
            // ✅ Add payment_verified_at column (timestamp when admin verifies)
            if (!Schema::hasColumn('custom_orders', 'payment_verified_at')) {
                $table->timestamp('payment_verified_at')->nullable()->after('payment_screenshot');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            // Drop columns if they exist
            if (Schema::hasColumn('custom_orders', 'estimated_price')) {
                $table->dropColumn('estimated_price');
            }
            
            if (Schema::hasColumn('custom_orders', 'payment_screenshot')) {
                $table->dropColumn('payment_screenshot');
            }
            
            if (Schema::hasColumn('custom_orders', 'payment_verified_at')) {
                $table->dropColumn('payment_verified_at');
            }
        });
    }
};