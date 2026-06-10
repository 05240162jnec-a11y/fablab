<?php
namespace App\Notifications;
use App\Models\Course;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewEnrollmentNotification extends Notification {
    use Queueable;
    public function __construct(protected User $user, protected Course $course) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        return [
            'type' => 'new_enrollment',
            'message' => "{$this->user->name} enrolled in \"{$this->course->title}\" ({$this->course->enrollment}/{$this->course->seat_limit} seats filled)",
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'icon' => '🎓', 'color' => 'blue',
        ];
    }
}