<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CompleteExpiredCourses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'courses:complete-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-complete enrollments for courses that have ended';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🕐 Starting auto-complete for expired courses...');

        // Get yesterday's date (to avoid completing on the exact end date)
        $yesterday = Carbon::yesterday()->endOfDay();

        // Find all courses that ended before yesterday
        $expiredCourses = Course::where('end_date', '<', $yesterday)
            ->where('status', 'active')
            ->get();

        if ($expiredCourses->isEmpty()) {
            $this->info('✅ No expired courses found.');
            return 0;
        }

        $this->info("📚 Found {$expiredCourses->count()} expired course(s).");

        $totalCompleted = 0;

        foreach ($expiredCourses as $course) {
            $this->newLine();
            $this->info("Processing: {$course->title}");
            $this->info("  End Date: {$course->end_date}");

            // Find all ACTIVE enrollments (not dropped, not already completed)
            $enrollments = CourseEnrollment::where('course_id', $course->id)
                ->where('status', 'enrolled')
                ->whereNull('unenrolled_at')
                ->get();

            if ($enrollments->isEmpty()) {
                $this->warn("  ⚠️  No active enrollments found.");
                continue;
            }

            $this->info("  👥 Found {$enrollments->count()} active enrollment(s).");

            // Update each enrollment to completed
            foreach ($enrollments as $enrollment) {
                $enrollment->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                $totalCompleted++;
                $this->line("  ✅ User {$enrollment->user_id} marked as completed.");
            }
        }

        $this->newLine();
        $this->info("🎉 Auto-complete finished!");
        $this->info("   Total enrollments marked as completed: {$totalCompleted}");

        return 0;
    }
}