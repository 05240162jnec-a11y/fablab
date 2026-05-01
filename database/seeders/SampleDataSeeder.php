<?php

namespace Database\Seeders;

use App\Models\Machine;
use App\Models\Booking;
use App\Models\Course;
use App\Models\CustomOrder;
use App\Models\ProductionTeam;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Machines
        $machines = [
            ['name' => '3D Printer - Ultimaker S5', 'type' => '3D Printing', 'description' => 'High-quality dual extrusion 3D printer', 'status' => 'available', 'last_used' => '2 hours ago', 'total_runtime' => '1,240 hrs'],
            ['name' => '3D Printer - Prusa i3 MK3S+', 'type' => '3D Printing', 'description' => 'Reliable single extrusion 3D printer', 'status' => 'in-use', 'last_used' => 'In progress', 'total_runtime' => '890 hrs'],
            ['name' => 'Laser Cutter - Epilog Zing 24', 'type' => 'Laser Cutting', 'description' => 'CO2 laser cutter for wood, acrylic', 'status' => 'available', 'last_used' => '1 day ago', 'total_runtime' => '2,100 hrs'],
            ['name' => 'CNC Router - Shapeoko 4', 'type' => 'CNC Machining', 'description' => 'Desktop CNC router', 'status' => 'maintenance', 'last_used' => '3 days ago', 'total_runtime' => '1,560 hrs'],
            ['name' => 'PCB Mill - Bantam Tools', 'type' => 'PCB Fabrication', 'description' => 'Precision PCB milling machine', 'status' => 'available', 'last_used' => '5 hours ago', 'total_runtime' => '670 hrs'],
            ['name' => 'Vinyl Cutter - Roland CAMM-1', 'type' => 'Vinyl Cutting', 'description' => 'Professional vinyl cutter', 'status' => 'available', 'last_used' => '1 day ago', 'total_runtime' => '430 hrs'],
            ['name' => 'Laser Cutter - Trotec Speedy 100', 'type' => 'Laser Cutting', 'description' => 'High-speed laser engraver', 'status' => 'in-use', 'last_used' => 'In progress', 'total_runtime' => '1,890 hrs'],
            ['name' => 'Soldering Station - Hakko FX-888D', 'type' => 'Electronics', 'description' => 'Digital soldering station', 'status' => 'available', 'last_used' => '3 hours ago', 'total_runtime' => '3,200 hrs'],
        ];

        foreach ($machines as $machine) {
            Machine::create($machine);
        }

        // Seed Courses
        $courses = [
            ['title' => 'Introduction to 3D Printing', 'instructor' => 'Prof. R. Nair', 'duration' => '4 weeks', 'schedule' => 'Mon & Wed, 10:00-12:00', 'description' => 'Learn fundamentals of 3D printing', 'enrollment' => 28, 'seat_limit' => 30, 'status' => 'active', 'registration_status' => 'closed'],
            ['title' => 'CNC Machining Fundamentals', 'instructor' => 'Dr. Meena K.', 'duration' => '6 weeks', 'schedule' => 'Tue & Thu, 14:00-16:00', 'description' => 'Comprehensive CNC course', 'enrollment' => 14, 'seat_limit' => 20, 'status' => 'active', 'registration_status' => 'open'],
            ['title' => 'PCB Design & Fabrication', 'instructor' => 'Prof. S. Rao', 'duration' => '5 weeks', 'schedule' => 'Wed & Fri, 09:00-11:00', 'description' => 'Design and fabricate PCBs', 'enrollment' => 20, 'seat_limit' => 25, 'status' => 'active', 'registration_status' => 'open'],
            ['title' => 'Laser Cutting Workshop', 'instructor' => 'Dr. A. Singh', 'duration' => '2 weeks', 'schedule' => 'Sat, 10:00-14:00', 'description' => 'Intensive laser cutting workshop', 'enrollment' => 0, 'seat_limit' => 15, 'status' => 'upcoming', 'registration_status' => 'open'],
            ['title' => 'Arduino & IoT Basics', 'instructor' => 'Prof. R. Nair', 'duration' => '8 weeks', 'schedule' => 'Mon & Thu, 15:00-17:00', 'description' => 'Introduction to Arduino and IoT', 'enrollment' => 35, 'seat_limit' => 35, 'status' => 'completed', 'registration_status' => 'closed'],
            ['title' => 'CAD for Beginners', 'instructor' => 'Dr. Meena K.', 'duration' => '3 weeks', 'schedule' => 'Tue & Fri, 10:00-12:00', 'description' => 'Learn CAD fundamentals', 'enrollment' => 10, 'seat_limit' => 25, 'status' => 'upcoming', 'registration_status' => 'open'],
        ];

        foreach ($courses as $course) {
            Course::create($course);
        }

        // Seed Production Team
        $team = [
            ['name' => 'Sunita Patil', 'email' => 'sunita.p@jnec.ac.in', 'phone' => '+91 98765 22222', 'gender' => 'female', 'password' => Hash::make('password'), 'status' => 'assigned', 'assigned_task' => 'PCB Fabrication - Sensor Board'],
            ['name' => 'Mohammed Ali', 'email' => 'mohammed.a@jnec.ac.in', 'phone' => '+91 98765 22223', 'gender' => 'male', 'password' => Hash::make('password'), 'status' => 'assigned', 'assigned_task' => 'Bulk Acrylic Engravings'],
            ['name' => 'Priya Menon', 'email' => 'priya.m@jnec.ac.in', 'phone' => '+91 98765 22224', 'gender' => 'female', 'password' => Hash::make('password'), 'status' => 'available', 'assigned_task' => null],
            ['name' => 'Arun Sharma', 'email' => 'arun.s@jnec.ac.in', 'phone' => '+91 98765 22225', 'gender' => 'male', 'password' => Hash::make('password'), 'status' => 'available', 'assigned_task' => null],
            ['name' => 'Lakshmi Devi', 'email' => 'lakshmi.d@jnec.ac.in', 'phone' => '+91 98765 22226', 'gender' => 'female', 'password' => Hash::make('password'), 'status' => 'assigned', 'assigned_task' => 'Custom Lab Equipment Mount'],
        ];

        foreach ($team as $member) {
            ProductionTeam::create($member);
        }

        // Seed Custom Orders
        $orders = [
            ['order_number' => 'CO-001', 'user_id' => 1, 'title' => 'Custom Sensor Housing', 'description' => '3D printed housing for sensor', 'material' => 'PLA', 'color' => 'White', 'dimensions' => '50mm x 30mm x 20mm', 'quantity' => 2, 'deadline' => '2026-03-15', 'status' => 'pending'],
            ['order_number' => 'CO-002', 'user_id' => 6, 'title' => 'Bulk Acrylic Name Plates', 'description' => 'Laser cut acrylic plates', 'material' => 'Acrylic', 'color' => 'Clear', 'dimensions' => '100mm x 50mm x 3mm', 'quantity' => 50, 'deadline' => '2026-03-10', 'status' => 'approved'],
            ['order_number' => 'CO-003', 'user_id' => 3, 'title' => 'Custom PCB Board', 'description' => 'Double-sided PCB', 'material' => 'FR4', 'color' => 'Green', 'dimensions' => '80mm x 60mm', 'quantity' => 5, 'deadline' => '2026-03-20', 'status' => 'pending'],
        ];

        foreach ($orders as $order) {
            CustomOrder::create($order);
        }
    }
}