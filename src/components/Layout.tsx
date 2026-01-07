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
  MoreHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

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
    <div className="min-h-screen font-sans text-gray-800 bg-[#FEF7FF]">
      {/* ================= DESKTOP HEADER (Sticky) ================= */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#4F378B] to-[#6750A4] p-2.5 rounded-xl shadow-lg shadow-[#4F378B]/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4F378B] to-[#21005D] tracking-tight">
                  Bimbel Cendekia
                </h1>
                <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Academic System</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      isActive 
                        ? "bg-white text-[#4F378B] shadow-md shadow-gray-200/50" 
                        : "text-gray-500 hover:text-[#4F378B] hover:bg-white/50"
                    )}
                  >
                    <item.icon className={clsx("h-4 w-4", isActive ? "text-[#4F378B]" : "text-gray-400")} />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'EN' : 'ID'}
              </button>
              <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('sign_out')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE HEADER (Simple) ================= */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#4F378B] p-2 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-[#4F378B]">Bimbel Cendekia</span>
        </div>
        <div className="flex gap-2">
           <button 
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="p-2 rounded-full bg-gray-50 text-gray-600 border border-gray-100"
            >
              <Globe className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full bg-red-50 text-red-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="pt-20 lg:pt-28 pb-28 lg:pb-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen transition-all duration-300">
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe pt-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-200",
                  isActive ? "text-[#4F378B]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={clsx(
                  "p-1.5 rounded-xl mb-1 transition-all duration-200",
                  isActive ? "bg-[#EADDFF]" : "bg-transparent"
                )}>
                  <item.icon className={clsx("h-5 w-5", isActive ? "fill-current" : "stroke-current")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
