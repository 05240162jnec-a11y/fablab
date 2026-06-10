<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Rejected</title>
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
                                            Order Payment Rejected
                                        </h1>

                                        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
                                            Dear <strong>{{ $order->user->name }}</strong>,
                                        </p>

                                        <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
                                            Thank you for placing your order with us. Unfortunately, we are unable
                                            to process your payment at this time. Please review the details and
                                            reason below.
                                        </p>

                                        <!-- Order details -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
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
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:130px;padding-bottom:10px;">Product</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">
                                                                @if($order->items && count($order->items) > 0)
                                                                    {{ $order->items[0]['name'] ?? 'N/A' }}
                                                                @else
                                                                    N/A
                                                                @endif
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:130px;padding-bottom:10px;">Total Amount</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;padding-bottom:10px;">Nu. {{ number_format($order->total_amount, 2) }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:130px;">Date</td>
                                                            <td style="font-size:14px;color:#0f172a;font-weight:600;">{{ $order->created_at->format('M d, Y') }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Rejection reason -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                            <tr>
                                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1e40af;border-radius:6px;padding:20px 24px;">
                                                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                                                        Reason for Rejection
                                                    </p>
                                                    <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">{{ $reason }}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Re-upload deadline -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #1e40af;border-radius:6px;padding:20px 24px;">
                                                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                                                        Payment Re-upload Deadline
                                                    </p>
                                                    <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">
                                                        You have <strong style="color:#0f172a;">{{ $hours ?? 24 }} hours</strong>
                                                        from the time of this email to re-upload your payment proof.
                                                        If you do not re-upload within this period, your order will be
                                                        permanently rejected and all items will be returned to stock.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="{{ url('/user/shop-orders?tab=orders') }}"
                                                        style="display:inline-block;padding:12px 32px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                                                        Re-upload Payment
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
                                            If you need assistance, please contact us at
                                            <a href="mailto:fablab.jnec@rub.edu.bt" style="color:#1e40af;text-decoration:none;font-weight:600;">fablab.jnec@rub.edu.bt</a>
                                            or call <strong style="color:#0f172a;">+975-77653429</strong>.
                                            We apologise for any inconvenience.
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