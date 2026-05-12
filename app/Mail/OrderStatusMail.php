<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $status;
    public $adminNote;

    public function __construct($order, $status, $adminNote = null)
    {
        $this->order     = $order;
        $this->status    = $status;
        $this->adminNote = $adminNote;
    }

    public function envelope(): Envelope
    {
        $subject = $this->status === 'approved'
            ? 'Your Order has been Approved - JNEC Fab Lab'
            : 'Your Order Status Update - JNEC Fab Lab';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.order-status');
    }
}