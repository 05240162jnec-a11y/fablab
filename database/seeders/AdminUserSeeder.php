<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // ← YOUR SINGLE ADMIN - CHANGE PASSWORD!
        Admin::create([
            'name' => 'FAB Lab Administrator',
            'email' => 'fablab.jnec@rub.edu.bt',  // ← Only this email!
            'password' => Hash::make('ChangeThisPassword123!'), // ← CHANGE THIS!
        ]);
    }
}