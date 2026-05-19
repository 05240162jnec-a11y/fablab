<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Approved - JNEC Fab Lab</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 24px 16px; color: #111827; }
        .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; }

        /* Banner */
        .banner { background-color: #15803d; padding: 32px 24px; text-align: center; }
        .banner-logo { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto 14px; background: #fff; }
        .banner h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .banner p { color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; }

        /* Content */
        .content { padding: 28px 28px 24px; }
        p.greeting { font-size: 15px; color: #111827; margin-bottom: 8px; }
        p.intro { font-size: 14px; color: #6b7280; line-height: 1.65; margin-bottom: 22px; }

        /* Order details */
        .section-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .details-box { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
        .details-row { display: flex; padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .details-row:last-child { border-bottom: none; }
        .details-row .key { color: #6b7280; width: 130px; flex-shrink: 0; }
        .details-row .val { color: #111827; font-weight: 600; }

        /* Pickup box */
        .pickup-box { border: 1px solid #bbf7d0; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
        .pickup-header { background: #f0fdf4; padding: 10px 14px; font-size: 10px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #bbf7d0; }
        .pickup-row { display: flex; padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f0fdf4; align-items: flex-start; gap: 10px; }
        .pickup-row:last-child { border-bottom: none; }
        .pickup-row .key { color: #6b7280; width: 130px; flex-shrink: 0; }
        .pickup-row .val { color: #111827; font-weight: 600; line-height: 1.5; }
        .order-pill { display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 4px; }

        /* Delivery box */
        .delivery-box { border: 1px solid #e9d5ff; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
        .delivery-header { background: #faf5ff; padding: 10px 14px; font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e9d5ff; }
        .delivery-row { display: flex; padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #faf5ff; align-items: flex-start; gap: 10px; }
        .delivery-row:last-child { border-bottom: none; }
        .delivery-row .key { color: #6b7280; width: 130px; flex-shrink: 0; }
        .delivery-row .val { color: #111827; font-weight: 600; }
        .delivery-note { background: #faf5ff; padding: 10px 14px; font-size: 12px; color: #7c3aed; line-height: 1.6; border-top: 1px solid #e9d5ff; }

        /* Contact */
        .contact-row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
        .contact-item { font-size: 13px; font-weight: 600; color: #374151; }

        /* Footer */
        .footer { border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 13px; color: #9ca3af; line-height: 1.7; }
        .footer strong { color: #374151; }
    </style>
</head>
<body>
<div class="wrapper">

    <div class="banner">
        <img src="../JNEC-Logo.png" alt="JNEC Fab Lab" class="banner-logo">
        <h1>Order Approved</h1>
        <p>JNEC Fab Lab</p>
    </div>

    <div class="content">

        <p class="greeting">Dear <strong>{{ $order->user->name ?? 'Valued Customer' }}</strong>,</p>
        <p class="intro">Great news! Your payment has been verified and your order is now approved. Please review your order details and delivery information below.</p>

        <div class="section-label">Order details</div>
        <div class="details-box">
            <div class="details-row">
                <span class="key">Order number</span>
                <span class="val">{{ $order->order_number }}</span>
            </div>
            <div class="details-row">
                <span class="key">Product</span>
                <span class="val">{{ $productName }}</span>
            </div>
            <div class="details-row">
                <span class="key">Total amount</span>
                <span class="val">Nu. {{ number_format($order->total_amount, 2) }}</span>
            </div>
        </div>


        <div class="pickup-box">
            <div class="pickup-header">🏪 Self pickup</div>
            <div class="pickup-row">
                <span class="key">Location</span>
                <span class="val">JNEC Fab Lab, Jigme Namgyel Engineering College</span>
            </div>
            <div class="pickup-row">
                <span class="key">Opening hours</span>
                <span class="val">9:00 AM – 5:00 PM &nbsp;·&nbsp; Monday to Saturday</span>
            </div>
            <div class="pickup-row">
                <span class="key">Order number</span>
                <span class="val">
                    Please present this when you arrive.<br>
                    <span class="order-pill">{{ $order->order_number }}</span>
                </span>
            </div>
        </div>
        <div class="delivery-box">
            <div class="delivery-header">📦 Delivery</div>
            <div class="delivery-row">
                <span class="key">Delivery address</span>
                <span class="val">{{ $order->shipping_address }}</span>
            </div>
            <div class="delivery-row">
                <span class="key">Delivery cost</span>
                <span class="val">To be negotiated</span>
            </div>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">Have questions? Reach out to us:</p>
        <div class="contact-row">
            <span class="contact-item">📞 +975-17789864</span>
            <span class="contact-item">✉ Reply to this email</span>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px; line-height: 1.6;">
            Thank you for choosing <strong style="color: #111827;">JNEC Fab Lab</strong>. We look forward to serving you!
        </p>

        <div class="footer">
            <strong>The JNEC Fab Lab Team</strong><br>
            Jigme Namgyel Engineering College
        </div>

    </div>
</div>
</body>
</html>