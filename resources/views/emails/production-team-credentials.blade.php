<x-mail::message>
# Welcome to JNEC Fab Lab Production Team!

Hello **{{ $member->name }}**,

You have been added to the Production Team at JNEC Fab Lab. Below are your login credentials:

<x-mail::panel>
**Email:** {{ $member->email }}  
**Password:** {{ $password }}
</x-mail::panel>

## Next Steps:

1. Visit the admin login page: [Login Here](http://127.0.0.1:8000/admin/login)
2. Enter your email and password
3. You can change your password after logging in

If you have any questions, please contact the lab administrator.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>