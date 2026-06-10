<?php
namespace App\Notifications;
use App\Models\ProductOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProductOrderStatusNotification extends Notification {
    use Queueable;
    public function __construct(protected ProductOrder $order, protected string $status, protected string $reason = '') {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        $messages = [
            'approved' => "Your product order #{$this->order->order_number} has been approved! We will prepare your items shortly.",
            'rejected' => "Your product order #{$this->order->order_number} payment was rejected." . ($this->reason ? " Reason: {$this->reason}" : '') . " Please re-upload your payment.",
        ];
        $icons = ['approved' => '✅', 'rejected' => '❌'];
        return [
            'type' => 'product_order_' . $this->status,
            'message' => $messages[$this->status] ?? "Your order #{$this->order->order_number} status updated to {$this->status}.",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'icon' => $icons[$this->status] ?? '🔔', 'color' => $this->status === 'approved' ? 'green' : 'red',
        ];
    }
}