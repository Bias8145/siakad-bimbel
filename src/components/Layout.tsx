import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarCheck, CalendarDays, GraduationCap, 
  LogOut, Moon, Sun, Menu, X, ChevronRight
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
    <div className="min-h-screen flex bg-[#FEF7FF] dark:bg-[#141218] text-[#1D1B20] dark:text-[#E6E1E5]">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#F3EDF7] dark:bg-[#1D1B20] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-lg tracking-tight">Cendekia Admin</span>
        </div>
        <div className="bg-[#6750A4] p-1.5 rounded-lg text-white">
           <GraduationCap className="h-5 w-5" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={clsx(
        "fixed top-0 left-0 h-full w-72 bg-[#F3EDF7] dark:bg-[#1D1B20] border-r border-gray-200 dark:border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#6750A4] p-2 rounded-xl text-white">
               <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg tracking-tight">Cendekia</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-[#E8DEF8] text-[#1D192B] font-bold dark:bg-[#4F378B] dark:text-[#EADDFF]" 
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                )}
              >
                <item.icon className={clsx("h-5 w-5 flex-shrink-0", isActive ? "text-[#1D192B] dark:text-[#EADDFF]" : "text-gray-500")} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 space-y-2 border-t border-gray-200 dark:border-white/5 bg-[#F3EDF7] dark:bg-[#1D1B20]">
           <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 w-full rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-all">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span>Tema: {theme === 'light' ? 'Terang' : 'Gelap'}</span>
           </button>
           <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-full text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all">
              <LogOut className="h-5 w-5" />
              <span>Keluar</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 transition-all duration-300">
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
