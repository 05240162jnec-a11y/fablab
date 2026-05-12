<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // who ordered
            $table->string('product_name');       // name of product
            $table->string('category');           // category of product
            $table->integer('quantity');          // how many
            $table->decimal('price', 10, 2);      // price per item
            $table->decimal('total_price', 10, 2); // total price
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('notes')->nullable();    // any notes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_orders');
    }
};