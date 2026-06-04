<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

// Send booking reminders daily at 8:00 PM
Schedule::command('bookings:send-reminders')->dailyAt('20:00');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ✅ Run automatically every hour in the background
Schedule::command('orders:process-expired')
    ->hourly();
