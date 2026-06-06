<?php

namespace App\Notifications;

use App\Models\CustomOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DesignRejectedNotification extends Notification
{
    use Queueable;

    protected $customOrder;
    protected $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(CustomOrder $customOrder, $reason = '')
    {
        $this->customOrder = $customOrder;
        $this->reason = $reason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $message = "Your design for order #{$this->customOrder->order_number} was rejected.";
        if ($this->reason) {
            $message .= " Reason: {$this->reason}";
        }

        return [
            'type' => 'design_rejected',
            'message' => $message,
            'order_id' => $this->customOrder->id,
            'order_number' => $this->customOrder->order_number,
            'reason' => $this->reason,
            'icon' => '🎨',
            'color' => 'red',
        ];
    }
}