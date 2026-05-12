<?php

use App\Http\Controllers\Api\CustomOrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\ProductOrderController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\MachineController;
use App\Http\Controllers\Api\MachineBookingController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseEnrollmentController;
use App\Http\Controllers\Api\MachineIssueController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\ProjectController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public routes - anyone can view
Route::get('/products', [ProductController::class, 'index']);
Route::get('/machines', [MachineController::class, 'index']);
Route::get('/courses',  [CourseController::class, 'index']);
Route::get('/projects', [ProjectController::class, 'index']);

// Google OAuth routes
Route::get('/auth/google',          [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Protected routes - need login
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Product Orders - user
    Route::get('/product-orders',         [ProductOrderController::class, 'index']);
    Route::post('/product-orders',        [ProductOrderController::class, 'store']);
    Route::delete('/product-orders/{id}', [ProductOrderController::class, 'destroy']);
    // Custom Orders - user
Route::post('/custom-orders',         [CustomOrderController::class, 'store']);
Route::get('/my-custom-orders',       [CustomOrderController::class, 'userOrders']);

// Custom Orders - admin
Route::get('/admin/custom-orders',              [CustomOrderController::class, 'adminOrders']);
Route::put('/admin/custom-orders/{id}/assign',  [CustomOrderController::class, 'assignOrder']);
Route::put('/admin/custom-orders/{id}/status',  [CustomOrderController::class, 'updateStatus']);

// Custom Orders - production team
Route::get('/production/my-orders',                    [CustomOrderController::class, 'myAssignedOrders']);
Route::put('/production/orders/{id}/status',           [CustomOrderController::class, 'updateProductionStatus']);

    // Machine Bookings - user
    Route::get('/machine-slots',                [MachineBookingController::class, 'getAvailableSlots']);
    Route::post('/machine-bookings',            [MachineBookingController::class, 'store']);
    Route::get('/my-machine-bookings',          [MachineBookingController::class, 'userBookings']);
    Route::put('/machine-bookings/{id}/cancel', [MachineBookingController::class, 'cancel']);

    // Machine Issues - user
    Route::post('/machine-issues',       [MachineIssueController::class, 'store']);
    Route::get('/my-machine-issues',     [MachineIssueController::class, 'userIssues']);

    // Course Enrollments - user
    Route::post('/course-enrollments',            [CourseEnrollmentController::class, 'enroll']);
    Route::get('/my-enrollments',                 [CourseEnrollmentController::class, 'userEnrollments']);
    Route::put('/course-enrollments/{id}/cancel', [CourseEnrollmentController::class, 'cancel']);

    // Feedback - user
    Route::post('/feedbacks',      [FeedbackController::class, 'store']);
    Route::get('/my-feedbacks',    [FeedbackController::class, 'userFeedbacks']);

    // Projects - user
    Route::post('/projects',              [ProjectController::class, 'store']);
    Route::get('/my-projects',            [ProjectController::class, 'userProjects']);
    Route::delete('/projects/{id}',       [ProjectController::class, 'destroy']);

    // Admin routes
    Route::get('/admin/users',                          [AdminController::class, 'getUsers']);
    Route::put('/admin/users/{id}/role',                [AdminController::class, 'updateUserRole']);
    Route::delete('/admin/users/{id}',                  [AdminController::class, 'deleteUser']);
    Route::get('/admin/product-orders',                 [AdminController::class, 'getProductOrders']);
    Route::put('/admin/product-orders/{id}/status',     [AdminController::class, 'updateProductOrderStatus']);
    Route::get('/admin/stats',                          [AdminController::class, 'getStats']);

    // Product management - admin
    Route::get('/admin/products',         [ProductController::class, 'adminIndex']);
    Route::post('/admin/products',        [ProductController::class, 'store']);
    Route::post('/admin/products/{id}',   [ProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);

    // Machine management - admin
    Route::get('/admin/machines',                     [MachineController::class, 'adminIndex']);
    Route::post('/admin/machines',                    [MachineController::class, 'store']);
    Route::post('/admin/machines/{id}',               [MachineController::class, 'update']);
    Route::delete('/admin/machines/{id}',             [MachineController::class, 'destroy']);
    Route::get('/admin/machine-bookings',             [MachineBookingController::class, 'adminBookings']);
    Route::put('/admin/machine-bookings/{id}/status', [MachineBookingController::class, 'updateStatus']);

    // Machine Issues - admin
    Route::get('/admin/machine-issues',              [MachineIssueController::class, 'adminIssues']);
    Route::put('/admin/machine-issues/{id}/status',  [MachineIssueController::class, 'updateStatus']);

    // Course management - admin
    Route::get('/admin/courses',                       [CourseController::class, 'adminIndex']);
    Route::post('/admin/courses',                      [CourseController::class, 'store']);
    Route::put('/admin/courses/{id}',                  [CourseController::class, 'update']);
    Route::delete('/admin/courses/{id}',               [CourseController::class, 'destroy']);
    Route::get('/admin/enrollments',                   [CourseEnrollmentController::class, 'adminEnrollments']);
    Route::put('/admin/enrollments/{id}/complete',     [CourseEnrollmentController::class, 'markCompleted']);

    // Feedback - admin
    Route::get('/admin/feedbacks',           [FeedbackController::class, 'adminFeedbacks']);
    Route::put('/admin/feedbacks/{id}/review', [FeedbackController::class, 'markReviewed']);

    // Projects - admin
    Route::get('/admin/projects',                  [ProjectController::class, 'adminProjects']);
    Route::put('/admin/projects/{id}/status',      [ProjectController::class, 'updateStatus']);
});