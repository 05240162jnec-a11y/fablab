<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;

// ← PUBLIC USER ROUTES
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ← ADMIN ROUTES (Separate!)
Route::prefix('admin')->group(function () {
    // Public admin login
    Route::post('/login', [AdminAuthController::class, 'login']);
    
    // ← Protected admin routes (require token)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Custom Orders
        Route::apiResource('custom-orders', \App\Http\Controllers\Api\Admin\CustomOrderController::class)
            ->only(['index', 'show', 'destroy']);
        Route::post('custom-orders/{id}/approve', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'approve']);
        Route::post('custom-orders/{id}/reject', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'reject']);
        
        // Users
        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class)
            ->only(['index', 'show', 'update', 'destroy']);
        
        // Production Team
        Route::apiResource('production-team', \App\Http\Controllers\Api\Admin\ProductionTeamController::class);
        
        // Machines
        Route::apiResource('machines', \App\Http\Controllers\Api\Admin\MachineController::class);
        Route::post('machines/{id}/toggle-maintenance', [\App\Http\Controllers\Api\Admin\MachineController::class, 'toggleMaintenance']);
        
        // Bookings
        Route::apiResource('bookings', \App\Http\Controllers\Api\Admin\BookingController::class)
            ->only(['index']);
        Route::post('bookings/{id}/update-status', [\App\Http\Controllers\Api\Admin\BookingController::class, 'updateStatus']);
        
        // Product Orders
        Route::apiResource('product-orders', \App\Http\Controllers\Api\Admin\ProductOrderController::class)
            ->only(['index']);
        Route::post('product-orders/{id}/approve', [\App\Http\Controllers\Api\Admin\ProductOrderController::class, 'approve']);
        Route::post('product-orders/{id}/reject', [\App\Http\Controllers\Api\Admin\ProductOrderController::class, 'reject']);
        Route::get('product-orders/{id}/screenshot', [\App\Http\Controllers\Api\Admin\ProductOrderController::class, 'screenshot']);
        
        // Courses
        Route::apiResource('courses', \App\Http\Controllers\Api\Admin\CourseController::class);
        Route::post('courses/{id}/toggle-registration', [\App\Http\Controllers\Api\Admin\CourseController::class, 'toggleRegistration']);
        
        
        // ✅ NEW: Course Enrollments Management
        Route::get('courses/{id}/enrollments', [\App\Http\Controllers\Api\Admin\CourseController::class, 'getEnrollments']);
        Route::delete('courses/{courseId}/enrollments/{userId}', [\App\Http\Controllers\Api\Admin\CourseController::class, 'removeEnrollment']);

        // Download enrolled users as CSV
        Route::get('courses/{id}/enrollments/download', [\App\Http\Controllers\Api\Admin\CourseController::class, 'downloadEnrollments']);

        // Clear active enrollments (set is_active = false)
        Route::post('courses/{id}/enrollments/clear', [\App\Http\Controllers\Api\Admin\CourseController::class, 'clearActiveEnrollments']);

        // Certificate template management
        Route::post('courses/{id}/certificate-template', [\App\Http\Controllers\Api\Admin\CourseController::class, 'uploadCertificateTemplate']);
        Route::delete('courses/{id}/certificate-template', [\App\Http\Controllers\Api\Admin\CourseController::class, 'removeCertificateTemplate']);

        // Certificate generation
        Route::get('courses/{courseId}/certificates/{userId}', [\App\Http\Controllers\Api\Admin\CourseController::class, 'generateCertificate']);
        Route::get('courses/{courseId}/certificates/bulk', [\App\Http\Controllers\Api\Admin\CourseController::class, 'generateBulkCertificates']);

        // Duplicate course for new semester
        Route::post('courses/{id}/duplicate', [\App\Http\Controllers\Api\Admin\CourseController::class, 'duplicate']);

        // Inventory routes
        Route::get('inventory', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'index']);
        Route::post('inventory/received', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'addReceived']);
        Route::post('inventory/issued', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'issueMaterial']);
        Route::delete('inventory/received/{id}', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'deleteReceived']);
        Route::delete('inventory/issued/{id}', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'deleteIssued']);
        
        // Projects Management (Admin)
        Route::get('/projects', [App\Http\Controllers\Api\ProjectController::class, 'index']);
        Route::get('/projects/{id}', [App\Http\Controllers\Api\ProjectController::class, 'show']);
        Route::post('/projects/{id}/approve', [App\Http\Controllers\Api\ProjectController::class, 'approve']);
        Route::post('/projects/{id}/reject', [App\Http\Controllers\Api\ProjectController::class, 'reject']);
        Route::delete('/projects/{id}', [App\Http\Controllers\Api\ProjectController::class, 'destroy']);

        // Gallery Management (Admin)
        Route::get('/gallery', [App\Http\Controllers\Api\GalleryController::class, 'index']);
        Route::get('/gallery/{id}', [App\Http\Controllers\Api\GalleryController::class, 'show']);
        Route::post('/gallery', [App\Http\Controllers\Api\GalleryController::class, 'store']);
        Route::put('/gallery/{id}', [App\Http\Controllers\Api\GalleryController::class, 'update']);
        Route::delete('/gallery/{id}', [App\Http\Controllers\Api\GalleryController::class, 'destroy']);

        // FAQ Management (Admin)
        Route::get('/faq', [App\Http\Controllers\Api\FAQController::class, 'index']);
        Route::get('/faq/{id}', [App\Http\Controllers\Api\FAQController::class, 'show']);
        Route::post('/faq', [App\Http\Controllers\Api\FAQController::class, 'store']);
        Route::put('/faq/{id}', [App\Http\Controllers\Api\FAQController::class, 'update']);
        Route::delete('/faq/{id}', [App\Http\Controllers\Api\FAQController::class, 'destroy']);
        
        // Dashboard Statistics (Admin)
        Route::get('/dashboard/stats', [App\Http\Controllers\Api\DashboardController::class, 'index']);
        
    }); // ← Close admin auth:sanctum middleware
}); // ← Close admin prefix

// ==========================================
// USER ROUTES (Authenticated)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile
    Route::get('/user/profile', [App\Http\Controllers\Api\UserController::class, 'profile']);

    // User Machines
    Route::get('/user/machines', [App\Http\Controllers\Api\UserMachineController::class, 'index']);
    Route::get('/user/machines/{id}/booked-dates', [App\Http\Controllers\Api\UserMachineController::class, 'bookedDates']);
    
    // User Courses
    Route::get('/user/courses', [App\Http\Controllers\Api\UserCourseController::class, 'index']);
    Route::get('/user/courses/{id}', [App\Http\Controllers\Api\UserCourseController::class, 'show']);
    Route::get('/user/my-courses', [App\Http\Controllers\Api\UserCourseController::class, 'myCourses']);
    Route::post('/user/courses/{id}/enroll', [App\Http\Controllers\Api\UserCourseController::class, 'enroll']);
    Route::post('/user/courses/{id}/unenroll', [App\Http\Controllers\Api\UserCourseController::class, 'unenroll']);
    
    // User Bookings
    Route::post('/user/bookings', [App\Http\Controllers\Api\UserBookingController::class, 'store']);
    Route::get('/user/my-bookings', [App\Http\Controllers\Api\UserBookingController::class, 'myBookings']);
    
});

// ← Email Verification Routes (outside admin group)
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

// Resend verification email (requires auth)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent!'], 200);
    })->middleware('throttle:6,1');
});

// Verify email endpoint (NO auth)
Route::get('/email/verify/{id}/{hash}', function (Request $request) {
    $user = \App\Models\User::find($request->route('id'));
    
    if (!$user || !hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
        return redirect('http://127.0.0.1:8000/verification/invalid');
    }
    
    if ($user->hasVerifiedEmail()) {
        return redirect('http://127.0.0.1:8000/verification/success');
    }

    if ($user->markEmailAsVerified()) {
        event(new Verified($user));
    }

    return redirect('http://127.0.0.1:8000/verification/success');
})->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

// Password Reset Routes
use App\Http\Controllers\Api\ForgotPasswordController;
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);