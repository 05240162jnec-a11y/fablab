<?php
namespace App\Notifications;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingCancelledNotification extends Notification {
    use Queueable;
    public function __construct(protected Booking $booking) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        return [
            'type' => 'booking_cancelled',
            'message' => "{$this->booking->user->name} cancelled their booking for {$this->booking->machine->name} ({$this->booking->start_date} → {$this->booking->end_date})",
            'booking_id' => $this->booking->id,
            'machine_name' => $this->booking->machine->name,
            'icon' => '❌', 'color' => 'red',
        ];
    }
}