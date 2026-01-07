import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarCheck, CalendarDays, GraduationCap, LogOut, Moon, Sun
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

  return (
    <div className="min-h-screen flex bg-[#FEF7FF] dark:bg-[#141218] text-[#1D1B20] dark:text-[#E6E1E5]">
      
      {/* Sidebar Navigation (Rail Style for Compact Density) */}
      <aside className="w-20 lg:w-72 bg-[#F3EDF7] dark:bg-[#1D1B20] border-r border-gray-200 dark:border-white/5 flex flex-col fixed h-full z-50 transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 gap-3">
          <div className="bg-[#6750A4] p-2 rounded-xl text-white">
             <GraduationCap className="h-6 w-6" />
          </div>
          <span className="hidden lg:block font-bold text-lg tracking-tight">Cendekia</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  "nav-pill group",
                  isActive ? "active" : ""
                )}
              >
                <item.icon className={clsx("h-6 w-6 flex-shrink-0", isActive ? "text-[#1D192B] dark:text-[#EADDFF]" : "text-gray-500")} />
                <span className="hidden lg:block">{item.name}</span>
                
                {/* Tooltip for Rail Mode */}
                <div className="lg:hidden absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 space-y-2 border-t border-gray-200 dark:border-white/5">
           <button onClick={toggleTheme} className="nav-pill w-full justify-center lg:justify-start">
              {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
              <span className="hidden lg:block text-sm">Tema</span>
           </button>
           <button onClick={handleLogout} className="nav-pill w-full justify-center lg:justify-start hover:bg-red-100 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400">
              <LogOut className="h-6 w-6" />
              <span className="hidden lg:block text-sm">Keluar</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 lg:ml-72 p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
