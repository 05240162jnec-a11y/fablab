<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Customize verification notification
    \Illuminate\Auth\Notifications\VerifyEmail::toMailUsing(function ($notifiable, $url) {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Verify Your Email - JNEC Fab-Lab')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Welcome to JNEC Fab-Lab Management System!')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email Address', $url)
            ->line('If you did not create an account, no further action is required.')
            ->line('Regards,')
            ->line('JNEC Fab-Lab Team');
    });
    }
}
