<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrainingCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $enrollment;

    public function __construct($enrollment)
    {
        $this->enrollment = $enrollment;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Training Completed - You Can Now Book Machines!'
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.training-completed');
    }
}