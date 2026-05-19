<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancelled - JNEC Fab Lab</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 24px 16px; color: #111827; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }

        .banner { background-color: #b91c1c; padding: 28px 24px; text-align: center; }
        .banner-logo { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; background: #ffffff; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; }
        .banner h1 { color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: 0.3px; }
        .banner p { color: rgba(255,255,255,0.75); font-size: 11px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }

        .content { padding: 28px; }
        .greeting { font-size: 15px; margin-bottom: 12px; color: #111827; }
        .intro { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 20px; }

        .details-box { background: #f9fafb; border-radius: 8px; padding: 16px 18px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
        .box-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table td { font-size: 13px; padding: 5px 0; vertical-align: top; }
        .details-table .key { color: #6b7280; width: 130px; }
        .details-table .val { color: #111827; font-weight: 500; }

        .reason-box { background: #fef2f2; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px; border: 1px solid #fca5a5; }
        .reason-box .box-label { color: #991b1b; }
        .reason-text { font-size: 14px; color: #7f1d1d; line-height: 1.6; }



        .contact-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; line-height: 1.6; }
        .contact-row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px; }
        .contact-item { font-size: 13px; font-weight: 600; color: #111827; }

        .footer { border-top: 1px solid #e5e7eb; padding-top: 18px; font-size: 13px; color: #6b7280; line-height: 1.7; }
        .footer strong { color: #111827; }
    </style>
</head>
<body>
    <div class="wrapper">

        <div class="banner">
            <img src="../image/JNEC logo V2_for media profile.png" alt="JNEC Fab Lab" class="banner-logo">
            <h1>Order Cancelled</h1>
            <p>JNEC Fab Lab</p>
        </div>

        <div class="content">

            <p class="greeting">Dear <strong>{{ $userName }}</strong>,</p>
            <p class="intro">
                Thank you for placing your order with us. Unfortunately, we are unable to process
                your payment at this time. Please review the details and reason below.
            </p>

            <div class="details-box">
                <div class="box-label">Order details</div>
                <table class="details-table">
                    <tr>
                        <td class="key">Order number</td>
                        <td class="val">{{ $orderNumber }}</td>
                    </tr>
                    <tr>
                        <td class="key">Product</td>
                        <td class="val">{{ $productName }}</td>
                    </tr>
                    <tr>
                        <td class="key">Total amount</td>
                        <td class="val">Nu. {{ number_format($totalAmount, 2) }}</td>
                    </tr>
                    <tr>
                        <td class="key">Date</td>
                        <td class="val">{{ $orderDate }}</td>
                    </tr>
                </table>
            </div>

            <div class="reason-box">
                <div class="box-label">⚠ Reason for cancellation</div>
                <p class="reason-text">{{ $rejectionReason }}</p>
            </div>

            <p class="contact-label">Need help? Reach out to our support team:</p>
            <div class="contact-row">
                <span class="contact-item">📞 +975-17789864</span>
                <span class="contact-item">✉ Reply to this email</span>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
                We apologise for any inconvenience.
            </p>

            <div class="footer">
                <strong>The JNEC Fab Lab Team</strong><br>
                Jigme Namgyel Engineering College
            </div>

        </div>
    </div>
</body>
</html>