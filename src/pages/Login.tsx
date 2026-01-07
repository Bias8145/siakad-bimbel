import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';
import { openWhatsApp, ADMIN_PHONE } from '../utils/whatsapp';

export default function Login() {
  const { t } = useLanguage();
  const { loginStudent } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'staff') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t('welcome'));
        navigate('/dashboard');
      } else {
        // Student Login Logic
        const { data: students, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !students) throw new Error(t('student_not_found'));
        if (!students.date_of_birth) throw new Error(t('dob_missing'));

        const dbDate = new Date(students.date_of_birth);
        const day = String(dbDate.getDate()).padStart(2, '0');
        const month = String(dbDate.getMonth() + 1).padStart(2, '0');
        const year = dbDate.getFullYear();
        const expectedPassword = `${day}${month}${year}`;

        if (dob !== expectedPassword) throw new Error(t('dob_wrong'));

        // Success
        loginStudent(students);
        toast.success(t('student_welcome'));
        
        // Use navigate directly instead of setTimeout for better UX
        navigate('/student-dashboard', { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-[#141218] relative overflow-hidden p-4">
      
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 shadow-sm border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back_to_home')}
      </button>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white dark:bg-[#1D1B20] rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/10 p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="bg-[#6750A4] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-[#6750A4]/30">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#1D1B20] dark:text-white mb-1">{t('login_title')}</h1>
            <p className="text-gray-500 text-sm">Masuk untuk mengakses portal akademik</p>
          </div>

          {/* Solid Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-[#2B2930] rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('student')}
              className={clsx(
                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200",
                activeTab === 'student' 
                  ? "bg-white dark:bg-[#4F378B] text-[#6750A4] dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              Siswa
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={clsx(
                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200",
                activeTab === 'staff' 
                  ? "bg-white dark:bg-[#4F378B] text-[#6750A4] dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              Staf / Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="m3-input-filled peer"
                placeholder=" "
              />
              <label htmlFor="email" className="m3-label-floating">
                {t('email_label')}
              </label>
            </div>

            {activeTab === 'staff' ? (
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="m3-input-filled peer"
                  placeholder=" "
                />
                <label htmlFor="password" className="m3-label-floating">
                  {t('password_label')}
                </label>
              </div>
            ) : (
              <div className="relative group">
                <input
                  type="text"
                  id="dob"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="m3-input-filled peer tracking-widest"
                  placeholder=" "
                  maxLength={8}
                />
                <label htmlFor="dob" className="m3-label-floating">
                  {t('dob_label')} (DDMMYYYY)
                </label>
                <p className="text-xs text-gray-500 mt-2 ml-4">Contoh: 25122005</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full m3-btn m3-btn-primary rounded-xl h-14 text-base font-bold mt-4 shadow-lg shadow-[#6750A4]/20">
              {loading ? <Loader2 className="animate-spin" /> : t('login_button')}
            </button>
          </form>

          {/* Contact Admin */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => openWhatsApp(ADMIN_PHONE, 'Halo Admin, saya mengalami kendala saat login.')}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#6750A4] transition-colors font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              Lupa Password / Hubungi Admin
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
