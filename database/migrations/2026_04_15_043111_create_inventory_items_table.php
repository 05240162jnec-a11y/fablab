<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., "Arduino Mega", "PLA Filament (White)"
            $table->string('category')->nullable(); // Electronics, Materials, Tools, etc.
            $table->string('unit')->default('units'); // units, sheets, meters, kg, etc.
            $table->decimal('standard_rate', 10, 2)->nullable(); // Standard rate in Nu.
            $table->text('description')->nullable();
            $table->integer('low_stock_threshold')->default(10); // Alert when stock < this
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};