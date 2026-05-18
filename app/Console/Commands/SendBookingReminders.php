<?php

namespace App\Console\Commands;

use App\Mail\BookingReminderMail;
use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendBookingReminders extends Command
{
    protected $signature = 'bookings:send-reminders';
    protected $description = 'Send booking reminders for tomorrow\'s bookings at 8 PM';

    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');
        
        // Get bookings for tomorrow that haven't been reminded
        $bookings = Booking::whereDate('start_date', $tomorrow)
            ->where('reminder_sent', false)
            ->with(['user', 'machine'])
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            try {
                Mail::to($booking->user->email)->send(new BookingReminderMail($booking));
                
                // Mark as reminded so we don't spam
                $booking->update(['reminder_sent' => true]);
                $count++;
                
                $this->info("✅ Sent to {$booking->user->email} for {$booking->machine->name}");
            } catch (\Exception $e) {
                $this->error("❌ Failed for {$booking->user->email}: {$e->getMessage()}");
            }
        }

        $this->info("📊 Total reminders sent: {$count}");
        return 0;
    }
}