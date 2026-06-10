<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $notificationType === 'available' ? 'Machine Available Again' : 'Machine Under Maintenance' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                    <!-- Logo Header -->
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <img src="{{ asset('images/logo.png') }}" alt="JNEC Fab Lab" width="72" height="72"
                                style="border-radius:50%;display:block;margin:0 auto;" />
                            <div style="margin-top:12px;font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
                                JNEC Fab Lab
                            </div>
                            <div style="font-size:12px;color:#64748b;margin-top:2px;letter-spacing:0.5px;text-transform:uppercase;">
                                Fabrication Laboratory
                            </div>
                        </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                        <td style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

                            <div style="height:4px;background:#1e40af;"></div>

                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:40px 40px 32px;">

                                        <!-- Title -->
                                        <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
                                            @if($notificationType === 'available')
                                                Machine Available Again
                                            @else
                                                Machine Under Maintenance
                                            @endif
                                        </h1>

                                        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
                                            Dear <strong>{{ $booking->user->name ?? 'User' }}</strong>,
                                        </p>

                                        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                                            {{ $message }}
                                        </p>

                                        <!-- Booking details -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                            <tr>
                                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1e40af;border-radius:6px;padding:20px 24px;">
                                                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                                                        @if($notificationType === 'available')
                                                            Previous Booking Details
                                                        @else
                                                            Your Booking Details
                                                        @endif
                                                    </p>
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:110px;padding-bottom:10px;">Machine</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">{{ $machineName }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:110px;padding-bottom:10px;">Type</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">{{ $machineType }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:110px;">Dates</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;">{{ $bookingDates }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- What this means -->
                                        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#0f172a;">
                                            @if($notificationType === 'available')
                                                What you can do now
                                            @else
                                                What this means
                                            @endif
                                        </p>

                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                            @if($notificationType === 'available')
                                            <tr><td style="padding:5px 0;">
                                                <table cellpadding="0" cellspacing="0"><tr>
                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">The machine is fully operational and ready for use.</td>
                                                </tr></table>
                                            </td></tr>
                                            <tr><td style="padding:5px 0;">
                                                <table cellpadding="0" cellspacing="0"><tr>
                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">You can now re-book your preferred dates.</td>
                                                </tr></table>
                                            </td></tr>
                                            <tr><td style="padding:5px 0;">
                                                <table cellpadding="0" cellspacing="0"><tr>
                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">Contact us if you need any assistance.</td>
                                                </tr></table>
                                            </td></tr>
                                            @else
                                            <tr><td style="padding:5px 0;">
                                                <table cellpadding="0" cellspacing="0"><tr>
                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">Your booking has been <strong style="color:#0f172a;">automatically cancelled</strong>.</td>
                                                </tr></table>
                                            </td></tr>
                                            <tr><td style="padding:5px 0;">
                                                <table cellpadding="0" cellspacing="0"><tr>
                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">No charges will be applied.</td>
                                                </tr></table>
                                            </td></tr>
                                            <tr><td style="padding:5px 0;">
                                                <table cellpadding="0" cellspacing="0"><tr>
                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">You will be notified when {{ $machineName }} is back online.</td>
                                                </tr></table>
                                            </td></tr>
                                            @endif
                                        </table>

                                        <!-- CTA -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                                            <tr>
                                                <td align="center">
                                                    @if($notificationType === 'available')
                                                    <a href="{{ config('app.url') }}/user/machines"
                                                        style="display:inline-block;padding:12px 32px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                                                        Book Machine Now
                                                    </a>
                                                    @else
                                                    <a href="{{ config('app.url') }}/user/machines"
                                                        style="display:inline-block;padding:12px 32px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                                                        Browse Available Machines
                                                    </a>
                                                    @endif
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.7;">
                                            If you have any questions, please contact our support team.
                                            We apologize for any inconvenience and appreciate your understanding.
                                        </p>

                                        <!-- Sign off -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;padding-top:24px;border-top:1px solid #f1f5f9;">
                                            <tr>
                                                <td>
                                                    <p style="margin:0;font-size:14px;color:#374151;font-weight:600;">JNEC Fab Lab Team</p>
                                                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Jigme Namgyel Engineering College</p>
                                                    <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Dewathang, Samdrupjongkhar, Bhutan</p>
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding:24px 0 8px;">
                            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                            <p style="margin:0;font-size:12px;color:#94a3b8;">
                                &copy; {{ date('Y') }} JNEC Fab Lab, Jigme Namgyel Engineering College. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>