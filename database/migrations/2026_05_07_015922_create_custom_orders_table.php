<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up()
{
    Schema::create('custom_orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Order details
        $table->string('title');
        $table->text('description');
        $table->integer('quantity')->default(1);
        
        // Design image
        $table->string('design_image')->nullable();
        
        // Status & pricing
        $table->enum('status', ['pending', 'in_progress', 'completed', 'rejected'])->default('pending');
        $table->decimal('estimated_price', 10, 2)->nullable();
        $table->text('rejection_reason')->nullable();
        
        // ✅ Production team assignment
        $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
        $table->timestamp('assigned_at')->nullable();
        
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('custom_orders');
    }
};