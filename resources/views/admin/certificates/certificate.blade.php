<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate - {{ $certificate_id }}</title>
    <style>
        @page {
            margin: 0;
            size: {{ $width }}px {{ $height }}px;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Georgia', serif;
            width: {{ $width }}px;
            height: {{ $height }}px;
            position: relative;
        }
        .certificate-container {
            position: relative;
            width: 100%;
            height: 100%;
        }
        .template-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        .overlay-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            padding: 0;
            box-sizing: border-box;
        }
        /* Student Name - Top Center */
        .student-name {
            position: absolute;
            top: 18%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 42px;
            font-weight: bold;
            color: #4A90E2;
            text-align: center;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Student Number - Below Name */
        .student-number {
            position: absolute;
            top: 24%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 20px;
            color: #333;
            text-align: center;
            margin: 0;
        }
        
        /* Course Name - Middle Center */
        .course-name {
            position: absolute;
            top: 32%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            text-align: center;
            margin: 0;
        }
        
        /* Institution Details */
        .institution {
            position: absolute;
            top: 38%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 18px;
            color: #333;
            text-align: center;
            margin: 0;
            line-height: 1.6;
        }
        
        /* Duration Dates */
        .duration {
            position: absolute;
            top: 44%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 18px;
            color: #333;
            text-align: center;
            margin: 0;
        }
        
        /* Completion Date - Top right area */
        .completion-date {
            position: absolute;
            top: 12%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            color: #666;
            text-align: center;
            margin: 0;
        }
        
        /* Certificate ID - Bottom right */
        .certificate-id {
            position: absolute;
            bottom: 80px;
            right: 100px;
            font-size: 12px;
            color: #888;
            font-family: 'Courier New', monospace;
        }
        
        /* Issue Date - Bottom right, above cert ID */
        .issue-date {
            position: absolute;
            bottom: 100px;
            right: 100px;
            font-size: 14px;
            color: #333;
            text-align: right;
        }
        
        /* Instructor Signature - Bottom left */
        .instructor-signature {
            position: absolute;
            bottom: 80px;
            left: 100px;
            text-align: left;
        }
        
        .signature-line {
            width: 250px;
            border-top: 2px solid #333;
            margin-bottom: 5px;
        }
        
        .instructor-name {
            font-size: 14px;
            color: #333;
            font-weight: bold;
        }
        
        .instructor-title {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <!-- Template Image -->
        <img src="{{ public_path('storage/' . $template_path) }}" 
             class="template-image" 
             alt="Certificate Template">
        
        <!-- Overlay Content -->
        <div class="overlay-content">
            <!-- Completion Date -->
            <div class="completion-date">
                Completed on: {{ $completion_date }}
            </div>
            
            <!-- Student Name -->
            <div class="student-name">{{ $student_name }}</div>
            
            <!-- Student Number -->
            <div class="student-number">Student No: {{ $student_number }}</div>
            
            <!-- Course Name -->
            <div class="course-name">{{ $course_name }}</div>
            
            <!-- Institution Details -->
            <div class="institution">
                training offered by Jigme Namgyel Engineering College, Dewathang
            </div>
            
            <!-- Duration -->
            <div class="duration">
                conducted from {{ $start_date }} to {{ $end_date }}.
            </div>
        </div>
        
        <!-- Certificate ID -->
        <div class="certificate-id">
            ID: {{ $certificate_id }}
        </div>
        
        <!-- Issue Date -->
        <div class="issue-date">
            Issued: {{ $issue_date }}
        </div>
        
        <!-- Instructor Signature -->
        <div class="instructor-signature">
            <div class="signature-line"></div>
            <div class="instructor-name">{{ $instructor_name }}</div>
            <div class="instructor-title">Course Instructor</div>
        </div>
    </div>
</body>
</html>