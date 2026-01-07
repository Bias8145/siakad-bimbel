import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Schedule from './pages/Schedule';
import Grades from './pages/Grades';
import Login from './pages/Login';
import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import AuthGuard from './components/AuthGuard';
import StudentGuard from './components/StudentGuard';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-center" toastOptions={{
              className: 'dark:bg-[#313033] dark:text-[#F4EFF4] bg-white text-gray-900 rounded-[16px]',
              style: {
                borderRadius: '16px',
              }
            }} />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              
              {/* Student Route Protected */}
              <Route path="/student-dashboard" element={
                <StudentGuard>
                  <StudentDashboard />
                </StudentGuard>
              } />
              
              {/* Admin Routes */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }>
                <Route index element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="grades" element={<Grades />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
