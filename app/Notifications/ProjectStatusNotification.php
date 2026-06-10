<?php
namespace App\Notifications;
use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectStatusNotification extends Notification {
    use Queueable;
    public function __construct(protected Project $project, protected string $status, protected string $reason = '') {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        $messages = [
            'approved' => "🎉 Your project \"{$this->project->title}\" has been approved and is now in the public gallery!",
            'rejected' => "Your project \"{$this->project->title}\" was rejected." . ($this->reason ? " Reason: {$this->reason}" : '') . " You can edit and resubmit.",
        ];
        $icons = ['approved' => '✅', 'rejected' => '❌'];
        return [
            'type' => 'project_' . $this->status,
            'message' => $messages[$this->status] ?? "Your project \"{$this->project->title}\" status updated.",
            'project_id' => $this->project->id,
            'icon' => $icons[$this->status] ?? '🔔', 'color' => $this->status === 'approved' ? 'green' : 'red',
        ];
    }
}