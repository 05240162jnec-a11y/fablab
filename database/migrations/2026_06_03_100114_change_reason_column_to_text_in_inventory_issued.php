<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('inventory_issued', function (Blueprint $table) {
            // ✅ Change reason from VARCHAR to TEXT (allows unlimited length)
            $table->text('reason')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('inventory_issued', function (Blueprint $table) {
            // Revert back to VARCHAR(255) if needed
            $table->string('reason', 255)->nullable()->change();
        });
    }
};