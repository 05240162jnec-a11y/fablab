<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    /**
     * Get a setting value by key
     */
    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value
     */
    public static function set($key, $value, $description = null)
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'description' => $description
            ]
        );
    }

    /**
     * Get payment upload deadline hours
     */
    public static function getPaymentUploadDeadlineHours()
    {
        return (int) static::get('payment_upload_deadline_hours', 24);
    }

    /**
     * ✅ NEW: Get stock alert threshold
     */
    public static function getStockAlertThreshold()
    {
        return (int) static::get('stock_alert_threshold', 5); // Default to 5 if not set
    }

    /**
     * ✅ NEW: Get the official FabLab WhatsApp number (digits only, no +, with country code)
     */
    public static function getFablabWhatsappNumber()
    {
        return static::get('fablab_whatsapp_number', '97577809291');
    }
    /**
     * ✅ NEW: Map a country_code (e.g. 'BT') to its international dialing code (e.g. '975')
     */
    public static function getDialingCode($countryCode)
    {
        $map = [
            'BT' => '975', // Bhutan
            'IN' => '91',  // India
            'US' => '1',   // United States
            'GB' => '44',  // United Kingdom
        ];

        return $map[$countryCode] ?? '975'; // Default to Bhutan if unknown/missing
    }
}