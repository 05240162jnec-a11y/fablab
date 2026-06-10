<?php
namespace App\Notifications;
use App\Models\ProductOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProductOrderPaymentUploadedNotification extends Notification {
    use Queueable;
    public function __construct(protected ProductOrder $order) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        return [
            'type' => 'product_order_payment_uploaded',
            'message' => "Payment uploaded for product order #{$this->order->order_number} by {$this->order->user->name}",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'icon' => '💳', 'color' => 'blue',
        ];
    }
}