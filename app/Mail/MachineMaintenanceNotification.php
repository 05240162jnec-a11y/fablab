<?php

namespace App\Mail;

use App\Models\Machine;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MachineMaintenanceNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $machine;
    public $booking;

    /**
     * Create a new message instance.
     */
    public function __construct(Machine $machine, Booking $booking)
    {
        $this->machine = $machine;
        $this->booking = $booking;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Machine Under Maintenance - Booking Update',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.machine-maintenance',
            with: [
                'machineName' => $this->machine->name,
                'machineType' => $this->machine->type ?? 'Machine',
                'bookingDates' => $this->formatBookingDates(),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Format booking dates for display
     */
    private function formatBookingDates()
    {
        if ($this->booking->start_date && $this->booking->end_date) {
            $start = date('F j, Y', strtotime($this->booking->start_date));
            $end = date('F j, Y', strtotime($this->booking->end_date));
            return $start . ' to ' . $end;
        }
        return 'Your upcoming booking';
    }
}