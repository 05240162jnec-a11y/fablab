<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('custom_orders', function (Blueprint $table) {
        // Add new column for multiple images
        $table->text('design_images')->nullable()->after('design_image');
        
        // Optional: Keep old column for backward compatibility, or drop it:
        // $table->dropColumn('design_image');
    });
}

public function down()
{
    Schema::table('custom_orders', function (Blueprint $table) {
        $table->dropColumn('design_images');
    });
}
};
