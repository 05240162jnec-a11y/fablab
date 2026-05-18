<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">🔧 Booking Reminder</h1>
            <p style="margin:10px 0 0;">Your Fab Lab session starts tomorrow!</p>
        </div>

        <div class="content">
            <p>Dear {{ $booking->user->name }},</p>
            <p>This is a friendly reminder that your booking for <strong>{{ $booking->machine->name }}</strong> starts tomorrow.</p>

            <div class="info-box">
                <p style="margin:5px 0;"><strong>📅 Date:</strong> {{ \Carbon\Carbon::parse($booking->start_date)->format('F d, Y') }}</p>
                <p style="margin:5px 0;"><strong>🔧 Machine:</strong> {{ $booking->machine->name }}</p>
                <p style="margin:5px 0;"><strong>📍 Location:</strong> {{ $booking->machine->location ?? 'Main Fab Lab' }}</p>
            </div>

            <p>Please arrive on time and bring any necessary materials for your project.</p>

            <p style="margin-top: 25px;">
                <a href="{{ url('/user/my-bookings') }}" class="button">View My Bookings</a>
            </p>
        </div>

        <div class="footer">
            <p>Thank you for using Fab Lab!</p>
            <p>Jigme Namgyel Engineering College</p>
        </div>
    </div>
</body>
</html>