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
  Globe
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);

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
      navigate('/'); // Redirect to Landing Page
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-gray-800 bg-[#FEF7FF]">
      {/* Desktop Dock / Taskbar (Left Side) */}
      <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-[100px] flex-col items-center py-8 glass-panel rounded-[32px] z-50 transition-all duration-300 hover:w-72 group shadow-xl border-white/40">
        <div className="mb-10 flex flex-col items-center justify-center w-full px-4 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-600/20 mb-3 group-hover:scale-110 transition-transform duration-300">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-tight">
            Bimbel Cendekia
          </span>
        </div>

        <nav className="flex-1 w-full px-4 space-y-3 flex flex-col items-center group-hover:items-stretch">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  "flex items-center p-3.5 rounded-2xl transition-all duration-300 relative group/item overflow-hidden",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                )}
              >
                <item.icon className={clsx("h-6 w-6 min-w-[24px]", isActive ? "text-white" : "")} />
                <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap absolute left-14 group-hover:static">
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 group-hover:opacity-0 pointer-events-none transition-opacity z-50 shadow-xl font-medium">
                  {item.name}
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="w-full px-4 space-y-3 flex flex-col items-center group-hover:items-stretch mt-auto">
          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              "flex items-center p-3.5 rounded-2xl transition-all duration-300 w-full relative",
              showSettings ? "bg-gray-100 text-blue-600" : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
            )}
          >
            <Settings className="h-6 w-6 min-w-[24px]" />
            <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap absolute left-14 group-hover:static">
              {t('settings')}
            </span>
          </button>

          {/* Language Selector */}
          {showSettings && (
            <div className="absolute bottom-24 left-4 right-4 glass-card p-2 space-y-1 animate-in slide-in-from-bottom-5 fade-in border border-gray-100 shadow-2xl">
              <button 
                onClick={() => setLanguage('en')}
                className={clsx("w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center transition-colors", language === 'en' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-600')}
              >
                <span className="mr-3 text-lg">🇬🇧</span> English
              </button>
              <button 
                onClick={() => setLanguage('id')}
                className={clsx("w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center transition-colors", language === 'id' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-600')}
              >
                <span className="mr-3 text-lg">🇮🇩</span> Indonesia
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center p-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-300 w-full relative group/logout"
          >
            <LogOut className="h-6 w-6 min-w-[24px]" />
            <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap absolute left-14 group-hover:static">
              {t('sign_out')}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-18 glass-panel z-40 flex items-center justify-between px-6 py-4 rounded-b-[24px] mx-2 mt-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-tight">Bimbel Cendekia</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="p-2.5 rounded-full hover:bg-gray-100/80 transition-colors active:scale-95"
          >
            <Globe className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={handleLogout} className="p-2.5 rounded-full hover:bg-red-50 text-red-500 transition-colors active:scale-95">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 glass-panel rounded-[24px] z-50 flex items-center justify-around px-2 shadow-2xl border-white/50">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={clsx(
                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 -translate-y-6 scale-110" 
                  : "text-gray-400 hover:text-blue-600 active:scale-95"
              )}
            >
              <item.icon className="h-6 w-6" />
            </NavLink>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[140px] p-4 lg:p-10 pt-28 lg:pt-10 pb-32 lg:pb-10 min-h-screen overflow-x-hidden transition-all duration-300">
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
