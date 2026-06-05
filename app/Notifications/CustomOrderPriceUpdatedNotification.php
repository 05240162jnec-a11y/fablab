<?php

namespace App\Notifications;

use App\Models\CustomOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CustomOrderPriceUpdatedNotification extends Notification
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
        return ['database']; // ✅ Store in database only (no email)
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'custom_order_price_updated',
            'message' => "Price updated for your order #{$this->customOrder->order_number}",
            'order_id' => $this->customOrder->id,
            'order_number' => $this->customOrder->order_number,
            'price' => $this->customOrder->estimated_price,
            'icon' => '💰',
            'color' => 'green',
        ];
    }
}