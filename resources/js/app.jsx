import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ IMPORT AND INITIALIZE AXIOS INTERCEPTORS (CRITICAL!)
import { setupAxiosInterceptors } from './axios';
setupAxiosInterceptors();

// ✅ Uniform dialog provider
import UniformDialogManager from './Components/UniformDialogManager';

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
import AdminProfile from './Pages/Admin/Profile';

// ✅ NEW: User Layout
import UserLayout from './Pages/User/UserLayout';

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

// ✅ NEW: User Profile
import UserProfile from './Pages/User/Profile';

// ✅ Tabbed Pages
import ShopOrders from './Pages/User/ShopOrders';
import Learning from './Pages/User/Learning';

// ✅ NEW: User Projects Page
import UserProjects from './Pages/User/Projects';

// ✅ Production Team Pages
import ProductionTeamDashboard from './Pages/ProductionTeam/Dashboard';
import ProductionTeamCustomOrders from './Pages/ProductionTeam/CustomOrders';
import ProductionTeamLayout from './Pages/ProductionTeam/ProductionTeamLayout';
import AssignedOrders from './Pages/ProductionTeam/AssignedOrders';
import ProductionTeamBookMachine from './Pages/ProductionTeam/BookMachine';
import ProductionTeamInventory from './Pages/ProductionTeam/Inventory';
import ProductionTeamProfile from './Pages/ProductionTeam/Profile';

// ✅ NEW: Production Team Machines & Products
import ProductionTeamMachines from './Pages/ProductionTeam/Machines';
import ProductionTeamProducts from './Pages/ProductionTeam/Products';
// ✅ NEW: Production Team Projects
import ProductionTeamProjects from './Pages/ProductionTeam/Projects';

const root = createRoot(document.getElementById('app'));

root.render(
    <UniformDialogManager>
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

                {/* Admin Pages */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="profile" element={<AdminProfile />} />
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

                {/* ✅ UPDATED: User Pages - Now wrapped in UserLayout */}
                <Route path="/user" element={<UserLayout />}>
                    <Route path="dashboard" element={<UserDashboard />} />

                    {/* ✅ NEW: User Profile Route */}
                    <Route path="profile" element={<UserProfile />} />

                    {/* Tabbed Routes */}
                    <Route path="shop-orders" element={<ShopOrders />} />
                    <Route path="machines" element={<UserMachines />} />
                    <Route path="learning" element={<Learning />} />

                    {/* User Projects Route */}
                    <Route path="projects" element={<UserProjects />} />

                    {/* Placeholder routes */}
                    <Route path="explore" element={<div className="p-10 text-center text-2xl font-bold">Explore Page (Coming Soon)</div>} />
                    <Route path="support" element={<div className="p-10 text-center text-2xl font-bold">Support Page (Coming Soon)</div>} />

                    {/* Existing routes */}
                    <Route path="book-machine" element={<BookMachine />} />
                    <Route path="courses" element={<UserCourses />} />
                    <Route path="custom-orders" element={<CustomOrders />} />
                    <Route path="shop-products" element={<ShopProducts />} />
                    <Route path="my-orders" element={<MyOrders />} />
                    <Route path="my-bookings" element={<MyBookings />} />
                    <Route path="my-enrollments" element={<MyEnrollments />} />
                </Route>

                {/* Production Team Routes */}
                <Route path="/production-team" element={<ProductionTeamLayout />}>
                    <Route path="dashboard" element={<ProductionTeamDashboard />} />
                    <Route path="profile" element={<ProductionTeamProfile />} />
                    <Route path="custom-orders" element={<ProductionTeamCustomOrders />} />
                    <Route path="book-machine" element={<ProductionTeamBookMachine />} />
                    <Route path="inventory" element={<ProductionTeamInventory />} />
                    <Route path="assigned-orders" element={<AssignedOrders />} />

                    {/* Production Team Machines & Products Routes */}
                    <Route path="machines" element={<ProductionTeamMachines />} />
                    <Route path="products" element={<ProductionTeamProducts />} />
                    <Route path="projects" element={<ProductionTeamProjects />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </UniformDialogManager>
);