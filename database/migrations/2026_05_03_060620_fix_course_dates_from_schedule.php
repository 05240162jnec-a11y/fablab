<?php

use App\Models\Course;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        echo "🔧 Starting date fix migration...\n";
        
        $courses = Course::all();
        $updated = 0;
        $failed = 0;
        
        foreach ($courses as $course) {
            // Skip if both dates already exist
            if ($course->start_date && $course->end_date) {
                continue;
            }
            
            // Try to parse schedule text: "2nd March to 18th May 23"
            $parsed = $this->parseSchedule($course->schedule);
            
            if ($parsed) {
                $course->start_date = $parsed['start'];
                $course->end_date = $parsed['end'];
                $course->save();
                
                echo "  ✅ Course {$course->id}: {$parsed['start']} → {$parsed['end']}\n";
                $updated++;
            } else {
                echo "  ❌ Course {$course->id}: Could not parse '{$course->schedule}'\n";
                Log::warning("Course {$course->id} schedule parse failed: {$course->schedule}");
                $failed++;
            }
        }
        
        echo "🎉 Migration complete: {$updated} updated, {$failed} failed\n";
    }
    
    /**
     * Parse schedule text like "2nd March to 18th May 23"
     * Returns ['start' => '2026-03-02', 'end' => '2026-05-18'] or null
     */
    private function parseSchedule($schedule)
    {
        if (!$schedule || !is_string($schedule)) {
            return null;
        }
        
        // Remove trailing comma and trim
        $schedule = trim(rtrim($schedule, ','));
        
        // Pattern: "2nd March to 18th May 23"
        $pattern = '/(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+to\s+(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+(\d{2,4}))?/i';
        
        if (!preg_match($pattern, $schedule, $matches)) {
            return null;
        }
        
        // Extract parts
        $startDay = (int)$matches[1];
        $startMonth = $this->monthToNumber($matches[2]);
        $endDay = (int)$matches[3];
        $endMonth = $this->monthToNumber($matches[4]);
        $year = isset($matches[5]) ? (int)$matches[5] : date('Y');
        
        // Handle 2-digit year (23 → 2023)
        if ($year < 100) {
            $year = 2000 + $year;
        }
        
        if (!$startMonth || !$endMonth) {
            return null;
        }
        
        return [
            'start' => sprintf('%04d-%02d-%02d', $year, $startMonth, $startDay),
            'end' => sprintf('%04d-%02d-%02d', $year, $endMonth, $endDay),
        ];
    }
    
    /**
     * Convert month name to number (March → 3)
     */
    private function monthToNumber($monthName)
    {
        $months = [
            'jan' => 1, 'january' => 1,
            'feb' => 2, 'february' => 2,
            'mar' => 3, 'march' => 3,
            'apr' => 4, 'april' => 4,
            'may' => 5,
            'jun' => 6, 'june' => 6,
            'jul' => 7, 'july' => 7,
            'aug' => 8, 'august' => 8,
            'sep' => 9, 'sept' => 9, 'september' => 9,
            'oct' => 10, 'october' => 10,
            'nov' => 11, 'november' => 11,
            'dec' => 12, 'december' => 12,
        ];
        
        $key = strtolower(substr($monthName, 0, 3));
        return $months[$key] ?? null;
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        echo "⚠️  This migration cannot be safely reversed.\n";
        echo "   Course dates have been updated. Manual review recommended.\n";
    }
};