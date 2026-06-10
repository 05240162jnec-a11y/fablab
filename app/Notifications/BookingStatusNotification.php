<?php
namespace App\Notifications;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingStatusNotification extends Notification {
    use Queueable;
    public function __construct(protected Booking $booking, protected string $status) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        $messages = [
            'confirmed'  => "Your booking for {$this->booking->machine->name} has been confirmed!",
            'completed'  => "Your booking for {$this->booking->machine->name} is marked as completed.",
            'cancelled'  => "Your booking for {$this->booking->machine->name} has been cancelled by admin.",
            'terminated' => "Your booking for {$this->booking->machine->name} has been terminated.",
        ];
        $icons = ['confirmed' => '✅', 'completed' => '🎉', 'cancelled' => '❌', 'terminated' => '🚫'];
        return [
            'type' => 'booking_status_updated',
            'message' => $messages[$this->status] ?? "Your booking status has been updated to {$this->status}.",
            'booking_id' => $this->booking->id,
            'status' => $this->status,
            'machine_name' => $this->booking->machine->name,
            'icon' => $icons[$this->status] ?? '🔔', 'color' => 'blue',
        ];
    }
}