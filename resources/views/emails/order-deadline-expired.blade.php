<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Deadline Expired</title>
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
            background-color: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        .order-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
        }
        .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⏰ Payment Deadline Expired</h1>
    </div>
    
    <div class="content">
        <p>Dear {{ $order->user->name }},</p>
        
        <p>We regret to inform you that the payment re-upload deadline for your order has expired.</p>
        
        <div class="order-details">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> {{ $order->order_number }}</p>
            <p><strong>Order Date:</strong> {{ $order->created_at->format('M d, Y') }}</p>
            <p><strong>Total Amount:</strong> Nu. {{ number_format($order->total_amount, 2) }}</p>
            <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Permanently Rejected</span></p>
        </div>
        
        <div class="warning-box">
            <strong>⚠️ What happened?</strong>
            <p style="margin: 10px 0 0 0;">
                Your order was rejected due to payment issues. You were given a deadline to re-upload your payment proof, 
                but the time has now expired. As a result:
            </p>
            <ul style="margin: 10px 0 0 20px;">
                <li>Your order has been permanently rejected</li>
                <li>All items have been returned to our stock</li>
            </ul>
        </div>
        
        <p><strong>What can you do?</strong></p>
        <p>If you still wish to purchase these items, please place a new order through our shop.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ url('/user/shop-orders') }}" class="btn">Place New Order</a>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        
        <p>Thank you for your understanding.</p>
        
        <p>Best regards,<br><strong>JNEC Fab Lab Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from JNEC Fab Lab. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} JNEC Fab Lab. All rights reserved.</p>
    </div>
</body>
</html>