<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Deadline Expired</title>
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
                                            Payment Deadline Expired
                                        </h1>

                                        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
                                            Dear <strong>{{ $order->user->name }}</strong>,
                                        </p>

                                        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                                            We regret to inform you that the payment re-upload deadline for your
                                            order has expired. Please review the details below.
                                        </p>

                                        <!-- Order details -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                            <tr>
                                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1e40af;border-radius:6px;padding:20px 24px;">
                                                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                                                        Order Details
                                                    </p>
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:130px;padding-bottom:10px;">Order Number</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">{{ $order->order_number }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:130px;padding-bottom:10px;">Order Date</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">{{ $order->created_at->format('M d, Y') }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:130px;padding-bottom:10px;">Total Amount</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">Nu. {{ number_format($order->total_amount, 2) }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:130px;">Status</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;">Permanently Rejected</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- What happened -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                            <tr>
                                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1e40af;border-radius:6px;padding:20px 24px;">
                                                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                                                        What Happened
                                                    </p>
                                                    <p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.7;">
                                                        Your order was rejected due to payment issues. You were given a deadline
                                                        to re-upload your payment proof, but the time has now expired.
                                                    </p>
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding:4px 0;">
                                                                <table cellpadding="0" cellspacing="0"><tr>
                                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">Your order has been permanently rejected.</td>
                                                                </tr></table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;">
                                                                <table cellpadding="0" cellspacing="0"><tr>
                                                                    <td style="width:20px;vertical-align:top;"><div style="width:6px;height:6px;background:#1e40af;border-radius:50%;margin-top:6px;"></div></td>
                                                                    <td style="font-size:14px;color:#475569;line-height:1.6;padding-left:10px;">All items have been returned to our stock.</td>
                                                                </tr></table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
                                            If you still wish to purchase these items, please place a new order
                                            through our shop. If you have any questions or need assistance,
                                            please do not hesitate to contact us.
                                        </p>

                                        <!-- CTA -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="{{ url('/user/shop-orders') }}"
                                                        style="display:inline-block;padding:12px 32px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                                                        Place New Order
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

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