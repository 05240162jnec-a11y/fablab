@component('mail::message')

@if($notificationType === 'available')
# ✅ Machine Available Again - Re-booking Open

Hello {{ $booking->user->name ?? 'User' }},

{{ $message }}

## Your Previous Booking Details:
- **Machine:** {{ $machineName }}
- **Type:** {{ $machineType }}
- **Previously Booked Dates:** {{ $bookingDates }}

## What You Can Do Now:
- The machine is fully operational and ready for use
- You can now re-book your preferred dates
- No action is required from our side

## Next Steps:
1. Visit our [Book a Machine]({{ config('app.url') }}/user/book-machine) page
2. Select your preferred dates and complete your booking
3. Contact us if you need any assistance

We're glad to have you back!

Thank You,<br>
{{ config('app.name') }} Team

@component('mail::button', ['url' => config('app.url') . '/user/book-machine', 'color' => 'success'])
Book Machine Now
@endcomponent

@else
# ⚠️ Machine Under Maintenance

Hello {{ $booking->user->name ?? 'User' }},

{{ $message }}

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
@endif

<small>If you have any questions, please contact our support team.</small>
@endcomponent