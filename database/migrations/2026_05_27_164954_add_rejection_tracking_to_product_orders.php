<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->timestamp('payment_rejected_at')->nullable()->after('updated_at');
            $table->timestamp('rejection_deadline')->nullable()->after('payment_rejected_at');
            $table->boolean('permanently_rejected')->default(false)->after('rejection_deadline');
        });
    }

    public function down()
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn(['payment_rejected_at', 'rejection_deadline', 'permanently_rejected']);
        });
    }
};