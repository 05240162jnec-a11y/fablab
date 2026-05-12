 <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1e3a5f, #1e40af); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
        .body { padding: 32px; }
        .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 16px; margin: 16px 0; }
        .approved { background: #dcfce7; color: #16a34a; }
        .rejected { background: #fee2e2; color: #dc2626; }
        .pending { background: #fef9c3; color: #ca8a04; }
        .order-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details h3 { margin: 0 0 16px; color: #0f172a; font-size: 16px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748b; font-size: 14px; }
        .detail-value { color: #0f172a; font-size: 14px; font-weight: 600; }
        .payment-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .payment-box h3 { margin: 0 0 12px; color: #1e40af; }
        .footer { background: #0f172a; padding: 24px; text-align: center; }
        .footer p { color: rgba(255,255,255,0.6); margin: 0; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">

        <!-- Header -->
        <div class="header">
            <h1>JNEC Fab Lab</h1>
            <p>Order Status Notification</p>
        </div>

        <!-- Body -->
        <div class="body">
            <p style="color: #374151; font-size: 16px;">Dear <strong>{{ $order->user->name }}</strong>,</p>

            <p style="color: #64748b;">Your order status has been updated.</p>

            <!-- Status Badge -->
            <div>
                <span class="status-badge {{ $status }}">
                    @if($status === 'approved') Order Approved
                    @elseif($status === 'rejected') Order Rejected
                    @elseif($status === 'completed') Order Completed
                    @else Status: {{ ucfirst($status) }}
                    @endif
                </span>
            </div>

            <!-- Order Details -->
            <div class="order-details">
                <h3>Order Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Order ID</span>
                    <span class="detail-value">#{{ $order->id }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Product</span>
                    <span class="detail-value">{{ $order->product_name }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">{{ $order->category }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity</span>
                    <span class="detail-value">{{ $order->quantity }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount</span>
                    <span class="detail-value">Nu. {{ $order->total_price }}</span>
                </div>
            </div>

            <!-- Payment Details (only for approved) -->
            @if($status === 'approved')
            <div class="payment-box">
                <h3>Payment Details</h3>
                <p style="color: #374151; font-size: 14px; margin: 0 0 12px;">Please make payment using the following details:</p>
                <div class="detail-row">
                    <span class="detail-label">Amount to Pay</span>
                    <span class="detail-value" style="color: #1e40af;">Nu. {{ $order->total_price }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method</span>
                    <span class="detail-value">Bank Transfer / Cash</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Bank Name</span>
                    <span class="detail-value">Bank of Bhutan</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Account Name</span>
                    <span class="detail-value">JNEC Fab Lab</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Account Number</span>
                    <span class="detail-value">1234567890</span>
                </div>
                <p style="color: #64748b; font-size: 13px; margin: 12px 0 0;">Please use Order ID <strong>#{{ $order->id }}</strong> as payment reference.</p>
            </div>
            @endif

            <!-- Admin Note -->
            @if($adminNote)
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Note from Admin:</strong> {{ $adminNote }}</p>
            </div>
            @endif

            @if($status === 'rejected')
            <p style="color: #64748b; font-size: 14px;">If you have any questions, please contact the Fab Lab team.</p>
            @endif

            <p style="color: #374151; margin-top: 24px;">Thank you for using JNEC Fab Lab services.</p>
            <p style="color: #374151;">Best regards,<br><strong>JNEC Fab Lab Team</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>JNEC Fab Lab, Jigme Namgyel Engineering College, Dewathang, Samdrupjongkhar</p>
            <p style="margin-top: 8px;">fablab@jnec.ac.in | +975 77602429</p>
        </div>

    </div>
</body>
</html>
