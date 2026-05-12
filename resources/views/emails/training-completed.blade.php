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
        .certificate-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #16a34a; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .certificate-box h2 { color: #16a34a; margin: 0 0 8px; font-size: 22px; }
        .certificate-box p { color: #166534; margin: 0; font-size: 14px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748b; font-size: 14px; }
        .detail-value { color: #0f172a; font-size: 14px; font-weight: 600; }
        .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .footer { background: #0f172a; padding: 24px; text-align: center; }
        .footer p { color: rgba(255,255,255,0.6); margin: 0; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">

        <!-- Header -->
        <div class="header">
            <h1>JNEC Fab Lab</h1>
            <p>Training Completion Certificate</p>
        </div>

        <!-- Body -->
        <div class="body">
            <p style="color: #374151; font-size: 16px;">Dear <strong>{{ $enrollment->user->name }}</strong>,</p>

            <p style="color: #64748b;">Congratulations! You have successfully completed your training at JNEC Fab Lab.</p>

            <!-- Certificate Box -->
            <div class="certificate-box">
                <div style="font-size: 48px; margin-bottom: 12px;">🎓</div>
                <h2>Training Completed!</h2>
                <p>You are now certified to use Fab Lab machines</p>
            </div>

            <!-- Course Details -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 16px; color: #0f172a; font-size: 16px;">Course Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Course</span>
                    <span class="detail-value">{{ $enrollment->course->title }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Instructor</span>
                    <span class="detail-value">{{ $enrollment->course->instructor }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Completed On</span>
                    <span class="detail-value">{{ $enrollment->completed_at->format('d M Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Certificate Status</span>
                    <span class="detail-value" style="color: #16a34a;">Issued</span>
                </div>
            </div>

            <!-- What you can do now -->
            <div class="info-box">
                <p style="margin: 0 0 8px; color: #1e40af; font-weight: 700; font-size: 14px;">What you can do now:</p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                    <li>Book machines that require training certification</li>
                    <li>Use 3D Printers, Laser Cutters, CNC Machines and more</li>
                    <li>Access all Fab Lab facilities during operating hours</li>
                </ul>
            </div>

            @if($enrollment->admin_note)
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Note from Admin:</strong> {{ $enrollment->admin_note }}</p>
            </div>
            @endif

            <p style="color: #374151; margin-top: 24px;">Thank you for completing the training. We look forward to seeing your projects!</p>
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