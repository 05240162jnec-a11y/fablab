<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // production team member
            $table->string('title');                              // project title
            $table->text('description');                         // description
            $table->string('material');                          // material needed
            $table->integer('quantity')->default(1);             // quantity
            $table->date('deadline')->nullable();                // deadline
            $table->string('file_path')->nullable();             // uploaded file
            $table->text('notes')->nullable();                   // additional notes
            $table->string('status')->default('pending');        // pending, in_progress, completed, rejected
            $table->text('admin_note')->nullable();              // admin note
            $table->text('production_note')->nullable();         // production team note
            $table->timestamp('completed_at')->nullable();       // when completed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_orders');
    }
};