<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_issued', function (Blueprint $table) {
            $table->id();
            
            // ✅ Link to the Material List
            $table->foreignId('material_id')->constrained()->onDelete('cascade');
            
            // ✅ Material Details (Store name directly for easy reading)
            $table->string('name'); 
            
            // ✅ Transaction Details
            $table->integer('quantity');
            $table->date('transaction_date');
            $table->string('issued_to');
            $table->string('reason')->nullable();
            $table->string('issued_by');
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_issued');
    }
};