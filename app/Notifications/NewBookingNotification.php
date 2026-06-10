<?php
namespace App\Notifications;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewBookingNotification extends Notification {
    use Queueable;
    public function __construct(protected Booking $booking) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        return [
            'type' => 'new_booking',
            'message' => "{$this->booking->user->name} booked {$this->booking->machine->name} from {$this->booking->start_date} to {$this->booking->end_date}",
            'booking_id' => $this->booking->id,
            'machine_name' => $this->booking->machine->name,
            'icon' => '🔧', 'color' => 'blue',
        ];
    }
}