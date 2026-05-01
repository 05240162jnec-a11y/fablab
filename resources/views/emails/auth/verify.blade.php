@component('mail::message')
# Hello {{ $user->name }}!

Welcome to **JNEC Fab-Lab Management System**!

Please click the button below to verify your email address and activate your account.

@component('mail::button', ['url' => $verificationUrl, 'color' => 'blue'])
Verify Email Address
@endcomponent

If you did not create an account, no further action is required.

Regards,<br>
{{ config('app.name') }} Team
@endcomponent