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

        // ✅ Terminate booking for no-show (admin only) - FIXED: removed duplicate 'admin' prefix
        Route::post('bookings/{id}/terminate', [\App\Http\Controllers\Api\Admin\BookingController::class, 'terminateBooking']);

        // ✅ FIXED: Product Orders (Admin Management)
        Route::apiResource('product-orders', \App\Http\Controllers\Api\Admin\ProductOrderController::class)
            ->only(['index', 'show', 'destroy']);
        Route::post('product-orders/{id}/approve', [\App\Http\Controllers\Api\Admin\ProductOrderController::class, 'approve']);
        Route::post('product-orders/{id}/reject', [\App\Http\Controllers\Api\Admin\ProductOrderController::class, 'reject']);
        Route::get('product-orders/{id}/screenshot', [\App\Http\Controllers\Api\Admin\ProductOrderController::class, 'screenshot']);

        // Products
        Route::get('/products', [App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
        Route::post('/products', [App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
        Route::put('/products/{product}', [App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
        Route::put('/products/{product}/toggle-status', [App\Http\Controllers\Api\Admin\ProductController::class, 'toggleStatus']);
        Route::delete('/products/{product}', [App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);

        // ✅ Custom Orders (Admin Management) - UPDATED
        Route::get('/custom-orders', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'index']);
        Route::get('/custom-orders/production-team', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'getProductionTeam']);
        Route::get('/custom-orders/{id}', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'show']);
        
        // ✅ NEW: Update price and notify user via email
        Route::post('/custom-orders/{id}/update-price', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'updatePrice']);
        
        // ✅ NEW: Verify payment screenshot (approve/reject)
        Route::post('/custom-orders/{id}/verify-payment', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'verifyPayment']);
        
        // ✅ Assign to production team (after payment verified)
        Route::post('/custom-orders/{id}/assign', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'assign']);
        
        Route::post('/custom-orders/{id}/update-status', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'updateStatus']);
        Route::delete('/custom-orders/{id}', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'destroy']);
        
        // Courses
        Route::apiResource('courses', \App\Http\Controllers\Api\Admin\CourseController::class);
        Route::post('courses/{id}/toggle-registration', [\App\Http\Controllers\Api\Admin\CourseController::class, 'toggleRegistration']);

        // ✅ Course Enrollments Management
        Route::get('courses/{id}/enrollments', [\App\Http\Controllers\Api\Admin\CourseController::class, 'getEnrollments']);
        Route::delete('courses/{courseId}/enrollments/{userId}', [\App\Http\Controllers\Api\Admin\CourseController::class, 'removeEnrollment']);

        // Download enrolled users as CSV
        Route::get('courses/{id}/enrollments/download', [\App\Http\Controllers\Api\Admin\CourseController::class, 'downloadEnrollments']);

        // Clear active enrollments
        Route::post('courses/{id}/enrollments/clear', [\App\Http\Controllers\Api\Admin\CourseController::class, 'clearActiveEnrollments']);

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
        
        // ✅ Admin Dashboard Stats
        Route::get('/dashboard/stats', [App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
        
    }); // ← Close admin auth:sanctum middleware
}); // ← Close admin prefix

// ==========================================
// USER ROUTES (Authenticated)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // User Dashboard
    Route::get('/user/dashboard', [App\Http\Controllers\Api\DashboardController::class, 'userDashboard']);

    // User Profile
    Route::get('/user/profile', [App\Http\Controllers\Api\UserController::class, 'profile']);

    // ✅ User Products (Shop)
    Route::get('/user/products', [App\Http\Controllers\Api\Admin\ProductController::class, 'index']);

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
    Route::post('/user/bookings/{id}/cancel', [App\Http\Controllers\Api\UserBookingController::class, 'cancel']);
    
    // ✅ Custom Orders (User) - UPDATED
    Route::get('/user/custom-orders', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'index']);
    Route::post('/user/custom-orders', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'store']);
    Route::get('/user/custom-orders/{id}', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'show']);
    
    // ✅ NEW: Upload payment screenshot
    Route::post('/user/custom-orders/{id}/upload-payment', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'uploadPayment']);
    
    // ✅ NEW: Cancel order (before payment verified)
    Route::post('/user/custom-orders/{id}/cancel', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'cancel']);
    
    // ✅ Get production team for display
    Route::get('/user/custom-orders/production-team', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'getProductionTeam']);

    // ✅ Product Orders (Shop)
    Route::get('/user/product-orders', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'index']);
    Route::post('/user/product-orders', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'store']);
    Route::get('/user/product-orders/{id}', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'show']);
    
    // ✅ Cancel and screenshot
    Route::post('/user/product-orders/{id}/cancel', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'cancel']);
    Route::get('/user/product-orders/{id}/screenshot', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'screenshot']);
    
});
// ==========================================
// ✅ PRODUCTION TEAM ROUTES (Authenticated)
// ==========================================
Route::middleware('auth:sanctum')->prefix('production-team')->group(function () {
    
    // Assigned Orders
    Route::get('/assigned-orders', [\App\Http\Controllers\Api\ProductionTeam\AssignedOrdersController::class, 'index']);
    Route::post('/assigned-orders/{id}/update-status', [\App\Http\Controllers\Api\ProductionTeam\AssignedOrdersController::class, 'updateStatus']);
    // ✅ NEW: Get all custom orders (read-only)
    Route::get('/custom-orders', [\App\Http\Controllers\Api\ProductionTeam\AssignedOrdersController::class, 'getAllCustomOrders']);
});

// ← Email Verification Routes
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent!'], 200);
    })->middleware('throttle:6,1');
});

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