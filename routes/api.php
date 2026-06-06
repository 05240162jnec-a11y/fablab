<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// ==========================================
// PUBLIC USER ROUTES
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// ADMIN ROUTES (Now uses unified auth)
// ==========================================
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    
    // Users
    Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class)
        ->only(['index', 'show', 'update', 'destroy']);
    Route::post('users/{id}/toggle-status', [\App\Http\Controllers\Api\Admin\UserController::class, 'toggleStatus']);   

    // Production Team
    Route::apiResource('production-team', \App\Http\Controllers\Api\Admin\ProductionTeamController::class);
    Route::post('production-team/{id}/toggle-status', [\App\Http\Controllers\Api\Admin\ProductionTeamController::class, 'toggleStatus']);
    
    // Machines
    Route::apiResource('machines', \App\Http\Controllers\Api\Admin\MachineController::class);
    Route::post('machines/{id}/toggle-maintenance', [\App\Http\Controllers\Api\Admin\MachineController::class, 'toggleMaintenance']);
    
    // Bookings
    Route::apiResource('bookings', \App\Http\Controllers\Api\Admin\BookingController::class)
        ->only(['index']);
    Route::post('bookings/{id}/update-status', [\App\Http\Controllers\Api\Admin\BookingController::class, 'updateStatus']);
    Route::post('bookings/{id}/terminate', [\App\Http\Controllers\Api\Admin\BookingController::class, 'terminateBooking']);

    // Product Orders (Admin Management)
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

    // Custom Orders (Admin Management)
    Route::get('/custom-orders', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'index']);
    Route::get('/custom-orders/production-team', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'getProductionTeam']);
    Route::get('/custom-orders/{id}', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'show']);
    Route::post('/custom-orders/{id}/update-price', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'updatePrice']);
    Route::post('/custom-orders/{id}/verify-payment', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'verifyPayment']);
    Route::post('/custom-orders/{id}/assign', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'assign']);
    Route::post('/custom-orders/{id}/update-status', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'updateStatus']);
    Route::delete('/custom-orders/{id}', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'destroy']);
    // Add after existing custom orders routes
    Route::post('/custom-orders/{id}/reject-design', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'rejectDesign']);
    Route::post('/custom-orders/bulk-delete', [\App\Http\Controllers\Api\Admin\CustomOrderController::class, 'bulkDelete']);
    
    // Courses
    Route::apiResource('courses', \App\Http\Controllers\Api\Admin\CourseController::class);
    Route::post('courses/{id}/toggle-registration', [\App\Http\Controllers\Api\Admin\CourseController::class, 'toggleRegistration']);
    Route::get('courses/{id}/enrollments', [\App\Http\Controllers\Api\Admin\CourseController::class, 'getEnrollments']);
    Route::delete('courses/{courseId}/enrollments/{userId}', [\App\Http\Controllers\Api\Admin\CourseController::class, 'removeEnrollment']);
    Route::get('courses/{id}/enrollments/download', [\App\Http\Controllers\Api\Admin\CourseController::class, 'downloadEnrollments']);
    Route::post('courses/{id}/enrollments/clear', [\App\Http\Controllers\Api\Admin\CourseController::class, 'clearActiveEnrollments']);
    Route::post('courses/{id}/duplicate', [\App\Http\Controllers\Api\Admin\CourseController::class, 'duplicate']);

    // Inventory routes
    Route::get('inventory', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'index']);
    Route::get('inventory/team-members', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'getTeamMembers']);
    Route::post('inventory/materials', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'addMaterial']);
    Route::post('inventory/received', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'addReceived']);
    Route::post('inventory/issued', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'issueMaterial']);
    Route::delete('inventory/received/{id}', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'deleteReceived']);
    Route::delete('inventory/issued/{id}', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'deleteIssued']);
    Route::get('inventory/threshold', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'getStockAlertThreshold']);
    Route::post('inventory/threshold', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'updateStockAlertThreshold']);
    Route::get('inventory/departments-users', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'getDepartmentsAndUsers']);
    
    // ==========================================
    // ✅ ADMIN PROJECT ROUTES (NEW)
    // ==========================================
    Route::get('/projects', [App\Http\Controllers\Api\AdminProjectController::class, 'index']);
    Route::post('/projects/{id}/approve', [App\Http\Controllers\Api\AdminProjectController::class, 'approve']);
    Route::post('/projects/{id}/reject', [App\Http\Controllers\Api\AdminProjectController::class, 'reject']);
    Route::delete('/projects/{id}', [App\Http\Controllers\Api\AdminProjectController::class, 'destroy']);
    // ✅ NEW: Bulk delete (must be BEFORE the {id} routes)
    Route::post('/projects/bulk-delete', [App\Http\Controllers\Api\AdminProjectController::class, 'bulkDelete']);
    // ✅ NEW: Download document
    Route::get('/projects/{id}/download', [App\Http\Controllers\Api\AdminProjectController::class, 'download']);

    // Gallery Management
    Route::get('/gallery', [App\Http\Controllers\Api\GalleryController::class, 'index']);
    Route::get('/gallery/{id}', [App\Http\Controllers\Api\GalleryController::class, 'show']);
    Route::post('/gallery', [App\Http\Controllers\Api\GalleryController::class, 'store']);
    Route::put('/gallery/{id}', [App\Http\Controllers\Api\GalleryController::class, 'update']);
    Route::delete('/gallery/{id}', [App\Http\Controllers\Api\GalleryController::class, 'destroy']);

    // FAQ Management
    Route::get('/faq', [App\Http\Controllers\Api\FAQController::class, 'index']);
    Route::get('/faq/{id}', [App\Http\Controllers\Api\FAQController::class, 'show']);
    Route::post('/faq', [App\Http\Controllers\Api\FAQController::class, 'store']);
    Route::put('/faq/{id}', [App\Http\Controllers\Api\FAQController::class, 'update']);
    Route::delete('/faq/{id}', [App\Http\Controllers\Api\FAQController::class, 'destroy']);

    // Profile routes (admin)
    Route::get('/profile', [\App\Http\Controllers\Api\Admin\ProfileController::class, 'show']);
    Route::post('/profile/update', [\App\Http\Controllers\Api\Admin\ProfileController::class, 'update']);
    Route::post('/profile/change-password', [\App\Http\Controllers\Api\Admin\ProfileController::class, 'changePassword']);
    
    // Admin Dashboard Stats
    Route::get('/dashboard/stats', [App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);

    // ✅ NEW: Settings Routes
    Route::get('/settings', [App\Http\Controllers\Api\Admin\SettingController::class, 'index']);
    Route::get('/settings/{key}', [App\Http\Controllers\Api\Admin\SettingController::class, 'show']);
    Route::put('/settings/{key}', [App\Http\Controllers\Api\Admin\SettingController::class, 'update']);
    Route::get('/settings/payment-deadline/hours', [App\Http\Controllers\Api\Admin\SettingController::class, 'getPaymentUploadDeadlineHours']);
    
}); // ← Close admin prefix with auth:sanctum

// ==========================================
// USER ROUTES (Authenticated)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    // ✅ Notification Routes
    Route::get('/user/notifications', [App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/user/notifications/unread-count', [App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('/user/notifications/{id}/read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    
    // User Dashboard
    Route::get('/user/dashboard', [App\Http\Controllers\Api\DashboardController::class, 'userDashboard']);

    // User Profile
    Route::get('/user/profile', [App\Http\Controllers\Api\UserController::class, 'profile']);

    // User Products (Shop)
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
    
    // Custom Orders (User)
    Route::get('/user/custom-orders', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'index']);
    Route::post('/user/custom-orders', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'store']);
    Route::get('/user/custom-orders/{id}', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'show']);
    Route::put('/user/custom-orders/{id}', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'update']);
    Route::post('/user/custom-orders/{id}/upload-payment', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'uploadPayment']);
    Route::post('/user/custom-orders/{id}/cancel', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'cancel']);
    Route::get('/user/custom-orders/production-team', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'getProductionTeam']);
    Route::post('/user/custom-orders/bulk-delete', [\App\Http\Controllers\Api\User\CustomOrderController::class, 'bulkDelete']);
    
    // Product Orders (Shop)
    Route::get('/user/product-orders', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'index']);
    Route::post('/user/product-orders', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'store']);
    Route::get('/user/product-orders/{id}', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'show']);
    Route::post('/user/product-orders/{id}/upload-payment', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'uploadPayment']);
    Route::post('/user/product-orders/{id}/cancel', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'cancel']);
    Route::get('/user/product-orders/{id}/screenshot', [\App\Http\Controllers\Api\User\ProductOrderController::class, 'screenshot']);
    // ✅ NEW: Process expired orders
    Route::post('/user/product-orders/process-expired', [App\Http\Controllers\Api\User\ProductOrderController::class, 'processExpiredOrders']);
    Route::post('/user/product-orders/bulk-delete', [App\Http\Controllers\Api\User\ProductOrderController::class, 'bulkDelete']);

    // ==========================================
    // ✅ USER PROJECT ROUTES (NEW)
    // ==========================================
    Route::get('/user/projects', [App\Http\Controllers\Api\UserProjectController::class, 'index']);
    Route::post('/user/projects', [App\Http\Controllers\Api\UserProjectController::class, 'store']);
    Route::put('/user/projects/{id}', [App\Http\Controllers\Api\UserProjectController::class, 'update']);
    // Project document download
    Route::get('/user/projects/{id}/download', [App\Http\Controllers\Api\UserProjectController::class, 'download']);
    // ✅ NEW: Bulk delete
    Route::post('/user/projects/bulk-delete', [App\Http\Controllers\Api\UserProjectController::class, 'bulkDelete']);
    
    // ✅ NEW: Cancel project
    Route::post('/user/projects/{id}/cancel', [App\Http\Controllers\Api\UserProjectController::class, 'cancel']);
});

// ==========================================
// PRODUCTION TEAM ROUTES (Authenticated)
// ==========================================
Route::middleware('auth:sanctum')->prefix('production-team')->group(function () {
    
    // Assigned Orders
    Route::get('/assigned-orders', [\App\Http\Controllers\Api\ProductionTeam\AssignedOrdersController::class, 'index']);
    Route::post('/assigned-orders/{id}/update-status', [\App\Http\Controllers\Api\ProductionTeam\AssignedOrdersController::class, 'updateStatus']);
    Route::get('/custom-orders', [\App\Http\Controllers\Api\ProductionTeam\AssignedOrdersController::class, 'getAllCustomOrders']);

    // ✅ NEW: Project Routes
    Route::get('/projects', [App\Http\Controllers\Api\ProductionTeam\ProjectController::class, 'index']);
    Route::post('/projects/{id}/approve', [App\Http\Controllers\Api\ProductionTeam\ProjectController::class, 'approve']);
    Route::post('/projects/{id}/reject', [App\Http\Controllers\Api\ProductionTeam\ProjectController::class, 'reject']);
    Route::delete('/projects/{id}', [App\Http\Controllers\Api\ProductionTeam\ProjectController::class, 'destroy']);
    Route::post('/projects/bulk-delete', [App\Http\Controllers\Api\ProductionTeam\ProjectController::class, 'bulkDelete']);
    Route::get('/projects/{id}/download', [App\Http\Controllers\Api\ProductionTeam\ProjectController::class, 'download']);
    
    // Profile routes
    Route::get('/profile', [\App\Http\Controllers\Api\ProductionTeam\ProfileController::class, 'show']);
    Route::post('/profile/update', [\App\Http\Controllers\Api\ProductionTeam\ProfileController::class, 'update']);
    Route::post('/profile/change-password', [\App\Http\Controllers\Api\ProductionTeam\ProfileController::class, 'changePassword']);

});

// ==========================================
// EMAIL VERIFICATION ROUTES
// ==========================================
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

// ==========================================
// PASSWORD RESET ROUTES
// ==========================================
use App\Http\Controllers\Api\ForgotPasswordController;
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);