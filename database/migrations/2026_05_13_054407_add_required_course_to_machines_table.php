<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('machines', function (Blueprint $table) {
            // Add required_course column (nullable - not all machines need training)
            $table->string('required_course')->nullable()->after('description');
        });
    }

    public function down()
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropColumn('required_course');
        });
    }
};