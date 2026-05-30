<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('inventory_issued', function (Blueprint $table) {
            $table->string('issued_to_email')->nullable()->after('issued_to');
            $table->string('issued_to_department')->nullable()->after('issued_to_email');
        });
    }

    public function down()
    {
        Schema::table('inventory_issued', function (Blueprint $table) {
            $table->dropColumn(['issued_to_email', 'issued_to_department']);
        });
    }
};