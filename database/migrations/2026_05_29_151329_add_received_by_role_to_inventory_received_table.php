<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('inventory_received', function (Blueprint $table) {
            $table->string('received_by_role')->nullable()->after('received_by');
        });
    }

    public function down()
    {
        Schema::table('inventory_received', function (Blueprint $table) {
            $table->dropColumn('received_by_role');
        });
    }
};