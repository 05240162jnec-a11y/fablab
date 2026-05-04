import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Auth Pages
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';

// Static Pages
import Home from './Pages/Static/Home/Home';
import Machines from './Pages/Static/Machines/Machines';
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

import UserDashboard from './Pages/User/Dashboard'; 
import BookMachine from './Pages/User/BookMachine'; 
import Courses from './Pages/User/Courses'; 

// Create root element
const root = createRoot(document.getElementById('app'));

// Render the app with React Router
root.render(
    <BrowserRouter>
        <Routes>
            {/* Static Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/machines" element={<Machines />} />
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

            {/* Admin Pages */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* <Route path="/admin/users" element={<AdminUsers />} /> */}  ← Comment out until created
            {/* Admin Pages */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />  {/* ← ADD THIS */}
            <Route path="/admin/production-team" element={<ProductionTeam />} />
            <Route path="/admin/machines" element={<AdminMachines />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/certificates" element={<Certificates />} />
            <Route path="/admin/custom-orders" element={<AdminCustomOrders />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />  
            <Route path="/admin/faq" element={<AdminFAQ />} /> 

            {/* User Pages */}
            <Route path="/user/dashboard" element={<UserDashboard />} /> 
            <Route path="/user/book-machine" element={<BookMachine />} />
            <Route path="/user/courses" element={<Courses />} />
        </Routes>
    </BrowserRouter>
);