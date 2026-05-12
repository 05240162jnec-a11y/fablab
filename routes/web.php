<?php

use Illuminate\Support\Facades\Route;

// ==========================================
// USER AUTHENTICATION ROUTES
// ==========================================
Route::get('/login', function () {
    return view('app');
})->name('login');

Route::get('/register', function () {
    return view('app');
})->name('register');

// ==========================================
// ADMIN ROUTES
// ==========================================
Route::get('/admin/login', function () {
    return view('app');
})->name('admin.login');

Route::get('/admin/dashboard', function () {
    return view('app');
})->name('admin.dashboard');



// ← ADD THIS:
Route::get('/admin/users', function () {
    return view('app');
})->name('admin.users');

Route::get('/admin/production-team', function () {
    return view('app');
})->name('admin.production-team');

Route::get('/admin/machines', function () {
    return view('app');
})->name('admin.machines');

Route::get('/admin/bookings', function () {
    return view('app');
})->name('admin.bookings');

Route::get('/admin/courses', function () {
    return view('app');
})->name('admin.courses');

Route::get('/admin/custom-orders', function () {
    return view('app');
})->name('admin.custom-orders');

Route::get('/admin/inventory', function () {
    return view('app');
})->name('admin.inventory');

Route::get('/admin/projects', function () {
    return view('app');
})->name('admin.projects');

// ==========================================
// USER ROUTES (Students, Faculty, External)
// ==========================================

// User Dashboard
Route::get('/user/dashboard', function () {
    return view('app');
})->name('user.dashboard');

// User Book a Machine
Route::get('/user/book-machine', function () {
    return view('app');
})->name('user.book-machine');

// User My Bookings
Route::get('/user/my-bookings', function () {
    return view('app');
})->name('user.my-bookings');

// User Course Registration
Route::get('/user/courses', function () {
    return view('app');
})->name('user.courses');

// User Announcements
Route::get('/user/announcements', function () {
    return view('app');
})->name('user.announcements');

// User FAQs
Route::get('/user/faqs', function () {
    return view('app');
})->name('user.faqs');

// User Help/Contact
Route::get('/user/contact', function () {
    return view('app');
})->name('user.contact');



// ==========================================
// STATIC PAGES
// ==========================================
Route::get('/', function () {
    return view('app');
});

Route::get('/machines', function () {
    return view('app');
});

Route::get('/shop', function () {
    return view('app');
});

Route::get('/training', function () {
    return view('app');
});

Route::get('/projects', function () {
    return view('app');
});

Route::get('/about', function () {
    return view('app');
});

Route::get('/gallery', function () {
    return view('app');
});

Route::get('/faq', function () {
    return view('app');
});

Route::get('/contact', function () {
    return view('app');
});

// ==========================================
// VERIFICATION ROUTES
// ==========================================
Route::get('/verification/success', function () {
    return view('app');
})->name('verification.success');

Route::get('/verification/invalid', function () {
    return view('app');
})->name('verification.invalid');

// ==========================================
// PASSWORD RESET ROUTES
// ==========================================
Route::get('/forgot-password', function () {
    return view('app');
});

Route::get('/reset-password/{token}', function () {
    return view('app');
});