<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Custom Order Price Updated</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .price { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .button:hover { background: #5568d3; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>🎨 JNEC Fab Lab</h2>
        <p>Custom Order Update</p>
    </div>
    
    <div class="content">
        <p>Hello <strong>{{ $user->name }}</strong>,</p>
        
        <p>Great news! Our team has reviewed your custom order design and we're ready to proceed.</p>
        
        <div class="order-info">
            <h3>📋 Order Details</h3>
            <p><strong>Order #:</strong> {{ $customOrder->order_number }}</p>
            <p><strong>Title:</strong> {{ $customOrder->title }}</p>
            <p><strong>Quantity:</strong> {{ $customOrder->quantity }}</p>
        </div>
        
        <div class="price">
            Total Estimated Price (Price X Quantity): Nu. {{ number_format($customOrder->estimated_price, 2) }}
        </div>
        
        <p>To proceed with your order, please complete the payment using the details below:</p>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <strong>💳 Payment Instructions:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Transfer to: [Your Bank Details]</li>
                <li>Reference: <code>{{ $customOrder->order_number }}</code></li>
                <li>Amount: Nu. {{ number_format($customOrder->estimated_price, 2) }}</li>
            </ul>
        </div>
        
        <p>After making the payment, please upload your payment screenshot in your Fab Lab account:</p>
        
        <div style="text-align: center;">
            <a href="http://127.0.0.1:8000/user/custom-orders" class="button">
                👉 Upload Payment Screenshot
            </a>
        </div>
        
        <p><strong>⏰ Note:</strong> Please complete payment within 48 hours to avoid order cancellation.</p>
        
        <p>If you have any questions, reply to this email or contact our support team.</p>
        
        <p>Best regards,<br>
        <strong>JNEC Fab Lab Team</strong></p>
    </div>
    
    <div class="footer">
        <p>JNEC Fab Lab | College of Science and Technology<br>
        Royal University of Bhutan</p>
        <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
</body>
</html>