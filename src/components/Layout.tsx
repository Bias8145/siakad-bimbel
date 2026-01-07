import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarDays, 
  GraduationCap, 
  LogOut,
  Settings,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Top Navigation Bar (Sticky) */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="hidden lg:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50">
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
            <div className="hidden lg:flex items-center gap-3">
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

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer (Slide Over) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-gray-900">{t('menu')}</h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all",
                      isActive 
                        ? "bg-[#4F378B] text-white shadow-lg shadow-[#4F378B]/30" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className={clsx("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <button 
                onClick={() => {
                  setLanguage(language === 'en' ? 'id' : 'en');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 text-gray-700 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <span>Bahasa</span>
                </div>
                <span className="text-xs font-bold bg-white px-2 py-1 rounded-md border border-gray-200">
                  {language === 'en' ? 'English' : 'Indonesia'}
                </span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                {t('sign_out')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen transition-all duration-300">
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
