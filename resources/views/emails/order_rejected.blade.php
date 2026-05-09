<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Rejected</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 25px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .order-box {
            background: white;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 4px solid #dc2626;
        }
        .reason-box {
            background: #fef2f2;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 4px solid #dc2626;
        }
        .footer {
            text-align: center;
            padding: 15px;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin: 0;">❌ Order Rejected</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">JNEC Fab Lab</p>
    </div>

    <div class="content">
        <p>Dear <strong>{{ $userName }}</strong>,</p>

        <p>We regret to inform you that your order has been <strong>rejected</strong>.</p>

        <div class="order-box">
            <p style="margin: 0 0 10px 0;"><strong>Order Details:</strong></p>
            <p style="margin: 5px 0;"><strong>Order #:</strong> {{ $orderNumber }}</p>
            <p style="margin: 5px 0;"><strong>Product:</strong> {{ $productName }}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> Nu. {{ number_format($totalAmount, 2) }}</p>
        </div>

        <div class="reason-box">
            <p style="margin: 0 0 10px 0;"><strong>Reason for Rejection:</strong></p>
            <p style="margin: 0; color: #991b1b;">{{ $rejectionReason }}</p>
        </div>

        <p style="margin-top: 20px;">
            If you have any questions about this decision, please contact us at <strong>+975-17789864</strong>.
        </p>

        <p>
            We apologize for any inconvenience caused.
        </p>
    </div>

    <div class="footer">
        <p>&copy; {{ date('Y') }} JNEC Fab Lab</p>
        <p style="font-size: 12px;">This is an automated message, please do not reply.</p>
    </div>
</body>
</html>