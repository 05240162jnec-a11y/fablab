<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->string('payment_method')->nullable();   // cash, bank transfer
            $table->string('payment_status')->default('unpaid'); // unpaid, paid
            $table->string('payment_reference')->nullable(); // payment reference number
            $table->text('admin_note')->nullable();          // note from admin
            $table->timestamp('approved_at')->nullable();    // when approved
            $table->timestamp('rejected_at')->nullable();    // when rejected
        });
    }

    public function down(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'payment_reference',
                'admin_note',
                'approved_at',
                'rejected_at',
            ]);
        });
    }
};