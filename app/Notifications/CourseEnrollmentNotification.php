<?php
namespace App\Notifications;
use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CourseEnrollmentNotification extends Notification {
    use Queueable;
    public function __construct(protected Course $course, protected string $action = 'enrolled') {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        $messages = [
            'enrolled'   => "You have successfully enrolled in \"{$this->course->title}\"! It starts on {$this->course->start_date?->format('M d, Y')}.",
            'unenrolled' => "You have been unenrolled from \"{$this->course->title}\".",
        ];
        $icons = ['enrolled' => '🎓', 'unenrolled' => '📤'];
        return [
            'type' => 'course_' . $this->action,
            'message' => $messages[$this->action] ?? "Course enrollment updated for \"{$this->course->title}\".",
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'icon' => $icons[$this->action] ?? '🔔', 'color' => 'blue',
        ];
    }
}