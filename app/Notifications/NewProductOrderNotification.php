<?php
namespace App\Notifications;
use App\Models\ProductOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewProductOrderNotification extends Notification {
    use Queueable;
    public function __construct(protected ProductOrder $order) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        return [
            'type' => 'new_product_order',
            'message' => "New product order #{$this->order->order_number} placed by {$this->order->user->name} — Nu. {$this->order->total_amount}",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'icon' => '🛒', 'color' => 'green',
        ];
    }
}