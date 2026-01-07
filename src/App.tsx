import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
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
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{
            className: 'bg-[#313033] text-[#F4EFF4] rounded-[16px]',
            style: {
              background: '#313033',
              color: '#F4EFF4',
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
    </LanguageProvider>
  );
}

export default App;
