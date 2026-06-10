<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Disabled</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

    <!-- Wrapper -->
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

                            <!-- Top accent bar -->
                            <div style="height:4px;background:#1e40af;"></div>

                            <!-- Body -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:40px 40px 32px;">

                                        <!-- Title -->
                                        <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
                                            Account Disabled
                                        </h1>

                                        <!-- Greeting -->
                                        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
                                            Dear <strong>{{ $user->name }}</strong>,
                                        </p>

                                        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                                            We are writing to inform you that your JNEC Fab Lab account has been
                                            <strong style="color:#0f172a;">disabled</strong> by the system administrator.
                                        </p>

                                        <!-- Info box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                            <tr>
                                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1e40af;border-radius:6px;padding:16px 20px;">
                                                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                                                        What this means
                                                    </p>
                                                    <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
                                                        You will not be able to log in or access any services until your account is reactivated by an administrator.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Steps -->
                                        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#0f172a;">
                                            What should you do?
                                        </p>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td style="padding:6px 0;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width:20px;vertical-align:top;padding-top:2px;">
                                                                <div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div>
                                                            </td>
                                                            <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">
                                                                If you believe this was done in error, please contact the administrator immediately.
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width:20px;vertical-align:top;padding-top:2px;">
                                                                <div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div>
                                                            </td>
                                                            <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">
                                                                If you have any pending activities or bookings, please reach out to resolve them.
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="mailto:fablab.jnec@rub.edu.bt"
                                                        style="display:inline-block;padding:12px 32px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                                                        Contact Administrator
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.7;">
                                            If you have any questions, please do not hesitate to reach out to our support team.
                                        </p>
                                        <p style="margin:0 0 4px;font-size:14px;color:#475569;">
                                            Thank you for your understanding.
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