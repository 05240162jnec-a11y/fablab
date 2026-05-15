@component('mail::message')
# ⚠️ Machine Under Maintenance

Hello {{ $booking->user->name ?? 'User' }},

We're writing to inform you that the machine you have booked, **{{ $machineName }}**, is currently under maintenance.

## Your Booking Details:
- **Machine:** {{ $machineName }}
- **Type:** {{ $machineType }}
- **Booked Dates:** {{ $bookingDates }}

## What This Means:
- Your booking has been **automatically cancelled**
- No charges will be applied
- You can re-book this machine once maintenance is complete

## Next Steps:
1. Check your [My Bookings]({{ config('app.url') }}/user/my-bookings) page for updates
2. Browse [available machines]({{ config('app.url') }}/user/book-machine) for alternatives
3. We'll notify you when {{ $machineName }} is back online

We apologize for any inconvenience and appreciate your understanding.

Thank You,<br>
{{ config('app.name') }} Team

@component('mail::button', ['url' => config('app.url') . '/user/book-machine'])
Browse Available Machines
@endcomponent

<small>If you have any questions, please contact our support team.</small>
@endcomponent