<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->unique()->constrained('inventory_items')->onDelete('cascade');
            $table->integer('current_stock')->default(0);
            $table->integer('total_received')->default(0);
            $table->integer('total_issued')->default(0);
            $table->timestamp('last_updated')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_stock');
    }
};