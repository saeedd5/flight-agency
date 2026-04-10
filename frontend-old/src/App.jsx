import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TranslationProvider } from './contexts/TranslationContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

// --- ایمپورت مستقیم و سریع تمام صفحات و کامپوننت‌ها ---

// Pages
// import HomePage from './pages/HomePage'; // صفحه اصلی سایت
import TicketsPage from './components/TicketsPage'; // صفحه مارکت‌پلیس آژانس‌ها
import AgencyPanel from './components/AgencyPanel'; // پنل اختصاصی آژانس
import Login from './admin/pages/Login'; // صفحه لاگین ادمین
import SaberTest from './components/SaberTest/SaberTest';

// Admin Panel Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import UserList from './admin/pages/Users/UserList';
import BookingList from './admin/pages/Bookings/BookingList';
import SearchLogs from './admin/pages/Logs/SearchLogs';
import Settings from './admin/pages/Settings/Settings';
import Air from './admin/pages/Air/Air';

/**
 * کامپوننت اصلی برنامه که وظیفه مدیریت Provider ها و آدرس‌دهی (Routing) را بر عهده دارد.
 */
function App() {
  return (
    // AuthProvider باید بیرونی‌ترین باشد تا همه به اطلاعات کاربر دسترسی داشته باشند
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TranslationProvider>
            <Routes>
              {/* --- مسیرهای عمومی و قابل دسترس برای همه --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/saber-test" element={<SaberTest />} />
              <Route path="/admin/login" element={<Login />} />

              {/* --- مسیر پنل آژانس (می‌توانید بعداً با یک ProtectedRoute محافظتش کنید) --- */}
              <Route path="/agency-panel" element={<AgencyPanel />} />

              {/* 
                --- مسیرهای محافظت شده پنل ادمین اصلی ---
                هر آدرسی که با /admin/ شروع شود (به جز /admin/login)، 
                ابتدا از فیلتر ProtectedRoute عبور می‌کند و سپس وارد AdminLayout می‌شود.
              */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                {/* مسیرهای فرزند /admin که در کامپوننت <Outlet /> در AdminLayout رندر می‌شوند */}
                <Route index element={<Dashboard />} /> 
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="air" element={<Air />} />
                <Route path="users" element={<UserList />} />
                <Route path="bookings" element={<BookingList />} />
                <Route path="logs" element={<SearchLogs />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
        </TranslationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;