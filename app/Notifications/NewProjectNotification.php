<?php
namespace App\Notifications;
use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewProjectNotification extends Notification {
    use Queueable;
    public function __construct(protected Project $project) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        return [
            'type' => 'new_project',
            'message' => "{$this->project->user->name} submitted a new project: \"{$this->project->title}\"",
            'project_id' => $this->project->id,
            'icon' => '📁', 'color' => 'purple',
        ];
    }
}