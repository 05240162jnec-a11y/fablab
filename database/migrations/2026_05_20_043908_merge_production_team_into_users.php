<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // 1. Get all production team members
        $teams = DB::table('production_teams')->get();

        $count = 0;

        foreach ($teams as $team) {
            // 2. Check if this email already exists in users table
            $exists = DB::table('users')->where('email', $team->email)->exists();

            // 3. If not, insert into users table with role 'production_team'
            if (!$exists) {
                DB::table('users')->insert([
                    'name'              => $team->name,
                    'email'             => $team->email,
                    'password'          => $team->password, // ✅ Already hashed
                    'role'              => 'production_team', // ✅ Key change
                    'gender'            => $team->gender ?? 'other',
                    'phone'             => $team->phone ?? null,
                    'email_verified_at' => now(), // ✅ Auto-verify so they can login immediately
                    'created_at'        => $team->created_at ?? now(),
                    'updated_at'        => now(),
                ]);
                $count++;
            }
        }

        echo "✅ Migration Complete: " . $count . " production team members copied to users table.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Safety: Only deletes users created with role 'production_team'
        DB::table('users')->where('role', 'production_team')->delete();
        echo "⚠️ Reverted: Removed production_team users from users table.\n";
    }
};