import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarDays, 
  GraduationCap, 
  LogOut,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('students'), href: '/dashboard/students', icon: Users },
    { name: t('attendance'), href: '/dashboard/attendance', icon: CalendarCheck },
    { name: t('schedule'), href: '/dashboard/schedule', icon: CalendarDays },
    { name: t('grades'), href: '/dashboard/grades', icon: GraduationCap },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(t('sign_out'));
      navigate('/'); 
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 bg-[#FEF7FF] dark:bg-[#141218] transition-colors duration-300">
      {/* ================= DESKTOP HEADER (Sticky) ================= */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/40 dark:border-white/5 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#4F378B] to-[#6750A4] p-2.5 rounded-xl shadow-lg shadow-[#4F378B]/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4F378B] to-[#21005D] dark:from-[#D0BCFF] dark:to-[#E8DEF8] tracking-tight">
                  Bimbel Cendekia
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase">Academic System</p>
              </div>
            </div>

            {/* Desktop Navigation Links (Inline Center) */}
            <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-full border border-gray-200/50 dark:border-white/10">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      isActive 
                        ? "bg-white dark:bg-[#4F378B] text-[#4F378B] dark:text-white shadow-md shadow-gray-200/50 dark:shadow-black/30" 
                        : "text-gray-500 dark:text-gray-400 hover:text-[#4F378B] dark:hover:text-[#D0BCFF] hover:bg-white/50 dark:hover:bg-white/5"
                    )}
                  >
                    <item.icon className={clsx("h-4 w-4", isActive ? "text-[#4F378B] dark:text-white" : "text-gray-400")} />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-white dark:bg-[#2B2930] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#36343b] transition-colors"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#2B2930] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#36343b] transition-colors"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'EN' : 'ID'}
              </button>
              <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('sign_out')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE HEADER (Simple) ================= */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#141218]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#4F378B] p-2 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-[#4F378B] dark:text-[#D0BCFF]">Bimbel Cendekia</span>
        </div>
        <div className="flex gap-2">
           <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-50 dark:bg-[#2B2930] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
           <button 
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="p-2 rounded-full bg-gray-50 dark:bg-[#2B2930] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700"
            >
              <Globe className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </button>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="pt-20 lg:pt-28 pb-32 lg:pb-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen transition-all duration-300">
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>

      {/* ================= MOBILE FLOATING BOTTOM NAVIGATION (Floating Island) ================= */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-white/90 dark:bg-[#2B2930]/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[24px] shadow-2xl shadow-purple-900/10 dark:shadow-black/50 px-2 py-2 flex justify-around items-center">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300",
                  isActive ? "text-[#4F378B] dark:text-[#D0BCFF]" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-[#EADDFF] dark:bg-[#4F378B]/30 rounded-2xl -z-10 scale-90 animate-in zoom-in duration-200"></div>
                )}
                <item.icon 
                  className={clsx("h-6 w-6 transition-transform duration-200", isActive ? "scale-110" : "")} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
