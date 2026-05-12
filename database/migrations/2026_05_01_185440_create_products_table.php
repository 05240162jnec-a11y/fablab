<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // product name
            $table->string('category');                      // category
            $table->text('description')->nullable();         // description
            $table->decimal('price', 10, 2);                 // price
            $table->integer('stock')->default(0);            // stock quantity
            $table->string('unit')->default('piece');        // unit (piece, kg, ml)
            $table->string('image')->nullable();             // product image
            $table->boolean('is_available')->default(true);  // available or not
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};