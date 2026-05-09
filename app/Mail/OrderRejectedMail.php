<?php

namespace App\Mail;

use App\Models\ProductOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $orderNumber;
    public $productName;
    public $totalAmount;
    public $userName;
    public $rejectionReason;

    /**
     * Create a new message instance.
     */
    public function __construct(ProductOrder $order, string $reason)
    {
        $this->orderNumber = $order->order_number;
        $this->userName = $order->user->name ?? 'Valued Customer';
        $this->totalAmount = $order->total_amount ?? 0;
        $this->rejectionReason = $reason;
        
        // Get first product name from items
        $items = $order->items ?? [];
        $firstItem = is_array($items) ? ($items[0] ?? null) : null;
        $this->productName = is_array($firstItem) ? ($firstItem['name'] ?? 'Your Order') : 'Your Order';
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject("❌ Order Rejected - {$this->orderNumber}")
                    ->view('emails.order_rejected');
    }
}