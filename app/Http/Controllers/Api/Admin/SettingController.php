<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Get a specific setting
     */
    public function show($key)
    {
        $value = Setting::get($key);
        
        return response()->json([
            'success' => true,
            'key' => $key,
            'value' => $value
        ]);
    }

    /**
     * Update a setting
     */
    public function update(Request $request, $key)
    {
        $request->validate([
            'value' => 'required',
            'description' => 'nullable|string'
        ]);

        $setting = Setting::set(
            $key, 
            $request->value, 
            $request->description
        );

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => $setting
        ]);
    }

    /**
     * Get payment upload deadline hours
     */
    public function getPaymentUploadDeadlineHours()
    {
        $hours = Setting::getPaymentUploadDeadlineHours();
        
        return response()->json([
            'success' => true,
            'hours' => $hours
        ]);
    }
}