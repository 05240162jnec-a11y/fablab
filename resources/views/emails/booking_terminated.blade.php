<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .content { background: #fff7ed; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #fed7aa; }
        .warning-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
        .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">⚠️ Booking Terminated</h1>
            <p style="margin:10px 0 0;">You missed your scheduled Fab Lab session</p>
        </div>

        <div class="content">
            <p>Dear {{ $booking->user->name }},</p>
            
            <p>Unfortunately, your booking for <strong>{{ $booking->machine->name }}</strong> has been terminated because you did not arrive within the scheduled time window.</p>

            <div class="warning-box">
                <p style="margin:5px 0;"><strong>📅 Original Date:</strong> {{ \Carbon\Carbon::parse($booking->start_date)->format('F d, Y') }}</p>
                <p style="margin:5px 0;"><strong>🔧 Machine:</strong> {{ $booking->machine->name }}</p>
                <p style="margin:5px 0;"><strong>⏰ Scheduled Time:</strong> {{ \Carbon\Carbon::parse($booking->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($booking->end_time)->format('g:i A') }}</p>
                <p style="margin:5px 0;"><strong>📍 Location:</strong> {{ $booking->machine->location ?? 'Main Fab Lab' }}</p>
            </div>

            <p>If you believe this termination was an error, or if you experienced an emergency, please contact the Fab Lab admin team immediately to discuss rescheduling options.</p>

            <p style="margin-top: 25px;">
                <a href="{{ url('/user/my-bookings') }}" class="button">View My Bookings</a>
            </p>
        </div>

        <div class="footer">
            <p>Thank you for understanding.</p>
            <p>Jigme Namgyel Engineering College - Fab Lab</p>
        </div>
    </div>
</body>
</html>