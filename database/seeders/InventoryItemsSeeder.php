<?php
namespace Database\Seeders;

use App\Models\InventoryItem;
use Illuminate\Database\Seeder;

class InventoryItemsSeeder extends Seeder
{
    public function run(): void
    {
        $materials = [
            // Electronics
            ['name' => 'Arduino Mega', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 850.00],
            ['name' => 'Raspberry Pi', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 1200.00],
            ['name' => 'Buzzer', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 25.00],
            ['name' => 'Big Buzzer', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 45.00],
            ['name' => 'Switch', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 15.00],
            ['name' => 'Push Button', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 10.00],
            ['name' => 'WiFi Module', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 350.00],
            ['name' => 'DC Motor', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 120.00],
            ['name' => 'LCD', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 180.00],
            ['name' => 'Transistor', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 5.00],
            ['name' => 'LED', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 3.00],
            ['name' => 'Electrolytic Capacitor', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 8.00],
            ['name' => 'Terminal Assortment', 'category' => 'Electronics', 'unit' => 'pack', 'standard_rate' => 150.00],
            ['name' => 'Diode', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 4.00],
            ['name' => 'IC Holder', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 20.00],
            ['name' => 'Breadboard Small', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 85.00],
            ['name' => 'PCB Resistor', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 2.00],
            ['name' => 'Relay', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 65.00],
            
            // 3D Printing Materials
            ['name' => 'PLA Filament (White)', 'category' => '3D Printing', 'unit' => 'kg', 'standard_rate' => 1500.00],
            ['name' => 'PLA Filament (Black)', 'category' => '3D Printing', 'unit' => 'kg', 'standard_rate' => 1500.00],
            ['name' => 'PLA Filament (Red)', 'category' => '3D Printing', 'unit' => 'kg', 'standard_rate' => 1500.00],
            ['name' => 'PLA Filament (Blue)', 'category' => '3D Printing', 'unit' => 'kg', 'standard_rate' => 1500.00],
            ['name' => 'PLA Filament (Yellow)', 'category' => '3D Printing', 'unit' => 'kg', 'standard_rate' => 1500.00],
            
            // Wood & Plywood
            ['name' => 'Plywood 4mm', 'category' => 'Wood', 'unit' => 'sheets', 'standard_rate' => 450.00],
            ['name' => 'Birch Ply 3mm', 'category' => 'Wood', 'unit' => 'sheets', 'standard_rate' => 550.00],
            ['name' => 'Birch Ply 4mm', 'category' => 'Wood', 'unit' => 'sheets', 'standard_rate' => 650.00],
            ['name' => 'Rubber Wood', 'category' => 'Wood', 'unit' => 'pieces', 'standard_rate' => 200.00],
            
            // Acrylic Sheets
            ['name' => 'Acrylic Sheet 2mm (Red)', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 350.00],
            ['name' => 'Acrylic Sheet 2mm (Blue)', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 350.00],
            ['name' => 'Acrylic Sheet 2mm (Green)', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 350.00],
            ['name' => 'Acrylic Sheet 2mm (Yellow)', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 350.00],
            ['name' => 'Acrylic Sheet 2mm (Black)', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 350.00],
            ['name' => 'Acrylic Sheet 2mm (White)', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 350.00],
            ['name' => 'Acrylic Sheet 2mm (Transparent)', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 350.00],
            ['name' => 'Acrylic Sheet 3mm', 'category' => 'Acrylic', 'unit' => 'sheets', 'standard_rate' => 450.00],
            
            // Vinyl & Stickers
            ['name' => 'Vinyl Sticker (Black)', 'category' => 'Vinyl', 'unit' => 'rolls', 'standard_rate' => 280.00],
            ['name' => 'Vinyl Sticker (White)', 'category' => 'Vinyl', 'unit' => 'rolls', 'standard_rate' => 280.00],
            ['name' => 'Vinyl Sticker (Red)', 'category' => 'Vinyl', 'unit' => 'rolls', 'standard_rate' => 280.00],
            ['name' => 'Vinyl Sticker (Green)', 'category' => 'Vinyl', 'unit' => 'rolls', 'standard_rate' => 280.00],
            ['name' => 'Vinyl Sticker (Blue)', 'category' => 'Vinyl', 'unit' => 'rolls', 'standard_rate' => 280.00],
            
            // CNC & Laser Parts
            ['name' => 'Copper Clad', 'category' => 'PCB', 'unit' => 'sheets', 'standard_rate' => 180.00],
            ['name' => 'Laser Lens', 'category' => 'Laser Parts', 'unit' => 'units', 'standard_rate' => 1200.00],
            ['name' => 'Laser Mirror', 'category' => 'Laser Parts', 'unit' => 'units', 'standard_rate' => 800.00],
            ['name' => 'CNC End Mill Bit', 'category' => 'CNC Parts', 'unit' => 'units', 'standard_rate' => 450.00],
            ['name' => 'CNC Router V Bit', 'category' => 'CNC Parts', 'unit' => 'units', 'standard_rate' => 380.00],
            
            // Fabrics & Textiles
            ['name' => 'Fabric Cloth', 'category' => 'Textiles', 'unit' => 'meters', 'standard_rate' => 120.00],
            ['name' => 'Matty Cloth', 'category' => 'Textiles', 'unit' => 'meters', 'standard_rate' => 150.00],
            ['name' => 'Micro Fiber Cloth', 'category' => 'Textiles', 'unit' => 'pieces', 'standard_rate' => 45.00],
            
            // Other Materials
            ['name' => 'PVC Sheet', 'category' => 'Plastics', 'unit' => 'sheets', 'standard_rate' => 220.00],
            ['name' => 'Glue Stick', 'category' => 'Adhesives', 'unit' => 'units', 'standard_rate' => 35.00],
            ['name' => 'Led Light (Warm White)', 'category' => 'Electronics', 'unit' => 'units', 'standard_rate' => 55.00],
        ];

        foreach ($materials as $material) {
            InventoryItem::firstOrCreate(
                ['name' => $material['name']],
                [
                    'category' => $material['category'],
                    'unit' => $material['unit'],
                    'standard_rate' => $material['standard_rate'],
                    'low_stock_threshold' => 10,
                ]
            );
        }
    }
}