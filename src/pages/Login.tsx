import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';

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

        loginStudent(students);
        toast.success(t('student_welcome'));
        setTimeout(() => navigate('/student-dashboard'), 100);
      }
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3EDF7] dark:bg-[#141218] relative overflow-hidden p-4">
      {/* Mesh Gradient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#EADDFF] dark:bg-[#4F378B] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#FFD8E4] dark:bg-[#4A041D] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>

      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md text-sm font-medium hover:bg-white/80 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back_to_home')}
      </button>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white/80 dark:bg-[#1D1B20]/80 backdrop-blur-xl rounded-[32px] shadow-xl border border-white/50 dark:border-white/10 p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="bg-[#EADDFF] dark:bg-[#4F378B] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#21005D] dark:text-[#EADDFF]">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#1D1B20] dark:text-white mb-1">{t('login_title')}</h1>
            <p className="text-gray-500 text-sm">Masuk untuk mengakses portal akademik</p>
          </div>

          {/* M3 Segmented Button (Tabs) */}
          <div className="flex p-1 bg-[#F3EDF7] dark:bg-[#2B2930] rounded-full mb-8 relative">
            <div className={clsx(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-[#4F378B] rounded-full shadow-sm transition-all duration-300 ease-out",
              activeTab === 'student' ? "left-1" : "left-[calc(50%+2px)]"
            )}></div>
            <button
              onClick={() => setActiveTab('student')}
              className={clsx(
                "flex-1 py-2.5 text-sm font-medium text-center relative z-10 transition-colors",
                activeTab === 'student' ? "text-[#1D1B20] dark:text-white" : "text-gray-500"
              )}
            >
              Siswa
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={clsx(
                "flex-1 py-2.5 text-sm font-medium text-center relative z-10 transition-colors",
                activeTab === 'staff' ? "text-[#1D1B20] dark:text-white" : "text-gray-500"
              )}
            >
              Staf / Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input (M3 Filled) */}
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

            <button type="submit" disabled={loading} className="w-full m3-btn m3-btn-primary rounded-full h-14 text-base font-bold mt-4">
              {loading ? <Loader2 className="animate-spin" /> : t('login_button')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
