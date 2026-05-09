<?php

namespace App\Mail;

use App\Models\ProductOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $items;
    public $deliveryOption;
    public $productName;
    public $totalAmount;
    public $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(ProductOrder $order)
    {
        $this->order = $order;
        
        // ✅ Items is already an array (cast in model)
        $this->items = $order->items ?? [];
        
        $this->deliveryOption = $order->delivery_option ?? 'pickup';
        
        // ✅ Safely get first product name from items array
        $firstItem = is_array($this->items) ? ($this->items[0] ?? null) : null;
        $this->productName = is_array($firstItem) ? ($firstItem['name'] ?? 'Your Order') : 'Your Order';
        
        $this->totalAmount = $order->total_amount ?? 0;
        $this->userName = $order->user->name ?? 'Valued Customer';
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->deliveryOption === 'shipping'
            ? "✅ Order Approved - {$this->productName}"
            : "✅ Order Approved for Pickup - {$this->productName}";

        return $this->subject($subject)
                    ->view('emails.order_approved');
    }
}