import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarCheck, CalendarDays, GraduationCap, 
  LogOut, Moon, Sun, Menu, X, ChevronRight, UserCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('students'), href: '/dashboard/students', icon: Users },
    { name: t('attendance'), href: '/dashboard/attendance', icon: CalendarCheck },
    { name: t('schedule'), href: '/dashboard/schedule', icon: CalendarDays },
    { name: t('grades'), href: '/dashboard/grades', icon: GraduationCap },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('sign_out'));
    navigate('/'); 
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-[#FEF7FF] dark:bg-[#141218] text-[#1D1B20] dark:text-[#E6E1E5] font-sans selection:bg-[#E8DEF8] selection:text-[#1D192B]">
      
      {/* Mobile Header - Glassmorphism */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#FEF7FF]/80 dark:bg-[#141218]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-4 z-40 transition-all duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 -ml-2 rounded-full hover:bg-[#E8DEF8] dark:hover:bg-[#4A4458] transition-colors active:scale-95"
          >
            <Menu className="h-6 w-6 text-[#1D192B] dark:text-[#E6E1E5]" />
          </button>
          <span className="font-bold text-lg tracking-tight text-[#1D192B] dark:text-[#E6E1E5]">Bimbel Cendekia</span>
        </div>
        <div className="bg-[#EADDFF] dark:bg-[#4F378B] p-2 rounded-xl text-[#21005D] dark:text-[#EADDFF] shadow-sm">
           <GraduationCap className="h-5 w-5" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={clsx(
        "fixed top-0 left-0 h-full w-80 bg-[#F3EDF7] dark:bg-[#1D1B20] border-r border-gray-200/50 dark:border-white/5 flex flex-col z-50 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] lg:translate-x-0 lg:static shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="h-24 flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#6750A4] dark:bg-[#D0BCFF] p-3 rounded-2xl text-white dark:text-[#381E72] shadow-lg shadow-[#6750A4]/20">
               <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-[#1D192B] dark:text-[#E6E1E5]">Cendekia</h1>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin Portal</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 rounded-full hover:bg-[#E8DEF8] dark:hover:bg-[#4A4458] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="px-4 mb-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Menu Utama</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={clsx(
                  "group flex items-center gap-4 px-5 py-3.5 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden",
                  isActive 
                    ? "bg-[#E8DEF8] text-[#1D192B] font-bold dark:bg-[#4F378B] dark:text-[#EADDFF] shadow-sm" 
                    : "text-gray-600 hover:bg-[#F7F2FA] dark:text-gray-400 dark:hover:bg-[#2B2930]"
                )}
              >
                <item.icon className={clsx(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-300", 
                  isActive ? "text-[#1D192B] dark:text-[#EADDFF]" : "text-gray-500 group-hover:text-[#6750A4] dark:group-hover:text-[#D0BCFF]"
                )} />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#6750A4] dark:bg-[#D0BCFF]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Profile & Footer */}
        <div className="m-4 p-4 rounded-[28px] bg-[#FEF7FF] dark:bg-[#2B2930] border border-gray-100 dark:border-white/5 shadow-sm">
           <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-[#EADDFF] dark:bg-[#4F378B] flex items-center justify-center text-[#21005D] dark:text-[#EADDFF] font-bold text-lg">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1D192B] dark:text-[#E6E1E5] truncate">Administrator</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@cendekia.com</p>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={toggleTheme} 
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl hover:bg-[#E8DEF8] dark:hover:bg-[#4A4458] transition-colors text-gray-600 dark:text-gray-300"
                title="Ganti Tema"
             >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="text-[10px] font-medium">{theme === 'light' ? 'Gelap' : 'Terang'}</span>
             </button>
             <button 
                onClick={handleLogout} 
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl hover:bg-[#FFD8E4] dark:hover:bg-[#5C3F4B] transition-colors text-red-600 dark:text-red-300"
                title="Keluar"
             >
                <LogOut className="h-5 w-5" />
                <span className="text-[10px] font-medium">Keluar</span>
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pt-20 lg:pt-0 transition-all duration-300 lg:pl-0">
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
