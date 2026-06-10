<?php
namespace App\Notifications;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewUserRegisteredNotification extends Notification {
    use Queueable;
    public function __construct(protected User $newUser) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toArray(object $notifiable): array {
        return [
            'type' => 'new_user_registered',
            'message' => "New user registered: {$this->newUser->name} ({$this->newUser->email}) as {$this->newUser->role}",
            'user_id' => $this->newUser->id,
            'icon' => '👤', 'color' => 'indigo',
        ];
    }
}