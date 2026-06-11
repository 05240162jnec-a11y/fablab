<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        // Register our custom auto-complete command
        \App\Console\Commands\CompleteExpiredCourses::class,
        // ✅ Process expired rejected product orders
        \App\Console\Commands\ProcessExpiredProductOrders::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule)
    {
        // Auto-complete expired courses daily at midnight
        $schedule->command('courses:complete-expired')
                 ->dailyAt('00:00')
                 ->timezone('Asia/Thimphu')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/scheduler.log'));

        // ✅ Process expired rejected product orders every 15 minutes
        $schedule->command('orders:process-expired')
                 ->everyFifteenMinutes()
                 ->timezone('Asia/Thimphu')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/scheduler.log'));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}