<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Production Team Login Credentials</title>
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

                                        <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
                                            Welcome to the Production Team
                                        </h1>

                                        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
                                            Dear <strong>{{ $member->name }}</strong>,
                                        </p>

                                        <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
                                            You have been added to the Production Team at JNEC Fab Lab.
                                            Below are your login credentials to access the system.
                                        </p>

                                        <!-- Credentials box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1e40af;border-radius:6px;padding:20px 24px;">
                                                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                                                        Your Login Credentials
                                                    </p>
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:110px;padding-bottom:10px;">Email</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">{{ $member->email }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:110px;">Password</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;">
                                                                <span style="background:#e2e8f0;padding:3px 10px;border-radius:4px;font-family:monospace;letter-spacing:0.5px;">{{ $password }}</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Next steps -->
                                        <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#0f172a;">
                                            Getting Started
                                        </p>

                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td style="padding:5px 0;">
                                                    <table cellpadding="0" cellspacing="0"><tr>
                                                        <td style="width:24px;font-size:13px;color:#64748b;font-weight:700;vertical-align:top;padding-top:1px;">1.</td>
                                                        <td style="font-size:14px;color:#475569;line-height:1.6;">Visit the login page and enter your credentials above.</td>
                                                    </tr></table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:5px 0;">
                                                    <table cellpadding="0" cellspacing="0"><tr>
                                                        <td style="width:24px;font-size:13px;color:#64748b;font-weight:700;vertical-align:top;padding-top:1px;">2.</td>
                                                        <td style="font-size:14px;color:#475569;line-height:1.6;">We recommend changing your password after your first login.</td>
                                                    </tr></table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:5px 0;">
                                                    <table cellpadding="0" cellspacing="0"><tr>
                                                        <td style="width:24px;font-size:13px;color:#64748b;font-weight:700;vertical-align:top;padding-top:1px;">3.</td>
                                                        <td style="font-size:14px;color:#475569;line-height:1.6;">Contact the lab administrator if you have any questions or issues.</td>
                                                    </tr></table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="{{ url('/login') }}"
                                                        style="display:inline-block;padding:12px 32px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                                                        Login to Your Account
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.7;">
                                            Please keep your credentials secure and do not share them with anyone.
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