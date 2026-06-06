<?php

namespace App\Notifications;

use App\Models\CustomOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderAssignedNotification extends Notification
{
    use Queueable;

    protected $customOrder;

    /**
     * Create a new notification instance.
     */
    public function __construct(CustomOrder $customOrder)
    {
        $this->customOrder = $customOrder;
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
        return [
            'type' => 'order_assigned',
            'message' => "New custom order #{$this->customOrder->order_number} has been assigned to you!",
            'order_id' => $this->customOrder->id,
            'order_number' => $this->customOrder->order_number,
            'title' => $this->customOrder->title,
            'icon' => '📋',
            'color' => 'purple',
        ];
    }
}