<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Disabled</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .header h1 {
            color: #dc3545;
            margin: 0;
            font-size: 24px;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .content p {
            margin-bottom: 15px;
            color: #555;
        }
        .alert-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .alert-box strong {
            color: #856404;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #888;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">⚠️</div>
            <h1>Account Disabled</h1>
        </div>

        <div class="content">
            <p>Dear {{ $user->name }},</p>

            <p>We are writing to inform you that your account has been <strong>disabled</strong> by the system administrator.</p>

            <div class="alert-box">
                <strong>What does this mean?</strong><br>
                You will no longer be able to log in to your account or access any services until your account is reactivated by an administrator.
            </div>

            <p><strong>What should you do?</strong></p>
            <ul>
                <li>If you believe this was done in error, please contact the administrator immediately.</li>
                <li>If you have any pending activities or bookings, please reach out to resolve them.</li>
            </ul>

            <p style="text-align: center;">
                <a href="mailto:admin@fablab.com" class="button">Contact Administrator</a>
            </p>

            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>

            <p>Thank you for your understanding.</p>

            <p>Best regards,<br>
            <strong>The Admin Team</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} Fab Lab Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>