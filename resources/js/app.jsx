import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ IMPORT AND INITIALIZE AXIOS INTERCEPTORS (CRITICAL!)
import { setupAxiosInterceptors } from './axios';
setupAxiosInterceptors();  // ← Registers Authorization header auto-add

// Auth Pages
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';

// Static Pages
import Home from './Pages/Static/Home/Home';
import StaticMachines from './Pages/Static/Machines/Machines';
import Shop from './Pages/Static/Shop/Shop';
import Training from './Pages/Static/Training/Training';
import Projects from './Pages/Static/Projects/Projects';
import About from './Pages/Static/About/About';
import Gallery from './Pages/Static/Gallery/Gallery';
import FAQ from './Pages/Static/FAQ/FAQ';
import Contact from './Pages/Static/Contact/Contact';

// Verification Pages
import VerificationSuccess from './Pages/Static/Verification/Success';
import VerificationInvalid from './Pages/Static/Verification/Invalid';

// Admin Pages
import AdminLogin from './Pages/Admin/Login';
import AdminDashboard from './Pages/Admin/Dashboard';
import Users from './Pages/Admin/Users';
import ProductionTeam from './Pages/Admin/ProductionTeam';
import AdminMachines from './Pages/Admin/Machines';
import AdminBookings from './Pages/Admin/Bookings';
import AdminCourses from './Pages/Admin/Courses';
import Certificates from './Pages/Admin/Certificates';
import AdminCustomOrders from './Pages/Admin/CustomOrders';
import AdminInventory from './Pages/Admin/Inventory';
import AdminProjects from './Pages/Admin/Projects';
import AdminGallery from './Pages/Admin/Gallery';
import AdminFAQ from './Pages/Admin/FAQ';
import AdminProducts from './Pages/Admin/Products';
import AdminLayout from './Pages/Admin/AdminLayout';

// User Pages
import UserDashboard from './Pages/User/Dashboard';
import BookMachine from './Pages/User/BookMachine';
import UserCourses from './Pages/User/Courses';
import CustomOrders from './Pages/User/CustomOrders';
import ShopProducts from './Pages/User/ShopProducts';
import MyOrders from './Pages/User/MyOrders';
import MyBookings from './Pages/User/MyBookings';
import MyEnrollments from './Pages/User/MyEnrollments';
import UserMachines from './Pages/User/Machines';

// ✅ Tabbed Pages
import ShopOrders from './Pages/User/ShopOrders';
import Learning from './Pages/User/Learning';


// ✅ Production Team Pages (NEW!)
import ProductionTeamDashboard from './Pages/ProductionTeam/Dashboard';
import ProductionTeamCustomOrders from './Pages/ProductionTeam/CustomOrders';
import ProductionTeamLayout from './Pages/ProductionTeam/ProductionTeamLayout';  // ← Add this!
import AssignedOrders from './Pages/ProductionTeam/AssignedOrders';

// Create root element
const root = createRoot(document.getElementById('app'));

// Render the app with React Router
root.render(
    <BrowserRouter>
        <Routes>
            {/* Static Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/machines" element={<StaticMachines />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/training" element={<Training />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />

            {/* Verification Pages */}
            <Route path="/verification/success" element={<VerificationSuccess />} />
            <Route path="/verification/invalid" element={<VerificationInvalid />} />

            {/* User Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Pages - Using Layout for persistent sidebar */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="production-team" element={<ProductionTeam />} />
                <Route path="machines" element={<AdminMachines />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="custom-orders" element={<AdminCustomOrders />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="faq" element={<AdminFAQ />} />
            </Route>

            {/* User Pages - Dashboard */}
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* ✅ Tabbed Routes */}
            <Route path="/user/shop-orders" element={<ShopOrders />} />
            <Route path="/user/machines" element={<UserMachines />} />
            <Route path="/user/learning" element={<Learning />} />

            {/* ✅ Production Team Routes - Using Layout for sidebar */}
            <Route path="/production-team" element={<ProductionTeamLayout />}>
                <Route path="dashboard" element={<ProductionTeamDashboard />} />
                <Route path="custom-orders" element={<ProductionTeamCustomOrders />} /> {/* ← NEW */}
            </Route>

            {/* Placeholder routes */}
            <Route path="/user/explore" element={<div className="p-10 text-center text-2xl font-bold">Explore Page (Coming Soon)</div>} />
            <Route path="/user/support" element={<div className="p-10 text-center text-2xl font-bold">Support Page (Coming Soon)</div>} />

            {/* Existing routes */}
            <Route path="/user/book-machine" element={<BookMachine />} />
            <Route path="/user/courses" element={<UserCourses />} />
            <Route path="/user/custom-orders" element={<CustomOrders />} />
            <Route path="/user/shop-products" element={<ShopProducts />} />
            <Route path="/user/my-orders" element={<MyOrders />} />
            <Route path="/user/my-bookings" element={<MyBookings />} />
            <Route path="/user/my-enrollments" element={<MyEnrollments />} />
        </Routes>
    </BrowserRouter>
);