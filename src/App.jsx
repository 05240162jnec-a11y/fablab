import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import ProductionLayout from "./layouts/ProductionLayout";

// Public pages
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import GoogleCallback from "./pages/GoogleCallback";

// User pages
import Dashboard from "./pages/Dashboard";
import BookMachine from "./pages/BookMachine";
import BookProduct from "./pages/BookProduct";
import CustomOrder from "./pages/CustomOrder";
import CourseRegistration from "./pages/CourseRegistration";
import MyBookings from "./pages/MyBookings";
import Announcements from "./pages/Announcements";
import FAQs from "./pages/FAQs";
import Help from "./pages/Help";
import ReportIssue from "./pages/ReportIssue";
import Feedback from "./pages/Feedback";
import Projects from "./pages/Projects";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminMachines from "./pages/admin/AdminMachines";
import AdminMachineBookings from "./pages/admin/AdminMachineBookings";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminIssues from "./pages/admin/AdminIssues";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminFeedbacks from "./pages/admin/AdminFeedbacks";
import AdminReports from "./pages/admin/AdminReports";
import AdminCustomOrders from "./pages/admin/AdminCustomOrders";

// Production pages
import ProductionDashboard from "./pages/production/ProductionDashboard";
import ProductionOrders from "./pages/production/ProductionOrders";

// blocks pages if not logged in - only regular users
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role === "admin" || role === "super_admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "production_team") return <Navigate to="/production/dashboard" replace />;
  return children;
}

// blocks pages if not admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "admin" && role !== "super_admin") return <Navigate to="/login" replace />;
  return children;
}

// blocks pages if not production team
function ProductionRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "production_team") return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* User pages */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book-machine" element={<BookMachine />} />
          <Route path="/book-product" element={<BookProduct />} />
          <Route path="/custom-order" element={<CustomOrder />} />
          <Route path="/course-registration" element={<CourseRegistration />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/help" element={<Help />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/projects" element={<Projects />} />
        </Route>

        {/* Admin pages */}
        <Route element={<AdminRoute><DashboardLayout /></AdminRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/custom-orders" element={<AdminCustomOrders />} />
          <Route path="/admin/machines" element={<AdminMachines />} />
          <Route path="/admin/machine-bookings" element={<AdminMachineBookings />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/issues" element={<AdminIssues />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        {/* Production Team pages */}
        <Route element={<ProductionRoute><ProductionLayout /></ProductionRoute>}>
          <Route path="/production/dashboard" element={<ProductionDashboard />} />
          <Route path="/production/orders" element={<ProductionOrders />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;