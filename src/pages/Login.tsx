import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Loader2, Calendar, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';

export default function Login() {
  const { t } = useLanguage();
  const { loginStudent } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'staff' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState(''); // DDMMYYYY format

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success(t('welcome'));
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !students) {
        throw new Error(t('student_not_found'));
      }

      if (!students.date_of_birth) {
        throw new Error(t('dob_missing'));
      }

      const dbDate = new Date(students.date_of_birth);
      const day = String(dbDate.getDate()).padStart(2, '0');
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const year = dbDate.getFullYear();
      
      const expectedPassword = `${day}${month}${year}`;

      if (dob !== expectedPassword) {
        throw new Error(t('dob_wrong'));
      }

      loginStudent(students);
      toast.success(t('student_welcome'));
      
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 100);

    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FEF7FF] relative overflow-hidden font-sans">
      {/* Premium Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-purple-300 to-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-pink-300 to-orange-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-gradient-to-r from-yellow-200 to-green-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm text-gray-600 hover:text-[#4F378B] hover:bg-white hover:scale-105 transition-all duration-300 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-bold text-sm tracking-wide">{t('back_to_home')}</span>
      </button>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500 mt-12 sm:mt-0">
        <div className="text-center mb-8">
          <div className="bg-white p-4 rounded-[28px] shadow-xl shadow-purple-900/5 inline-block mb-4 transform hover:scale-105 transition-transform duration-300 ring-1 ring-white/50">
            <GraduationCap className="h-12 w-12 text-[#4F378B]" />
          </div>
          <h1 className="text-4xl font-bold text-[#1D1B20] tracking-tight mb-2">{t('login_title')}</h1>
          <p className="text-gray-500 text-lg">{t('login_subtitle')}</p>
        </div>

        {/* Premium Glass Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-2 shadow-2xl border border-white/80 ring-1 ring-white/50">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/50 rounded-[32px] mb-6 border border-white/50">
            <button
              onClick={() => setActiveTab('student')}
              className={clsx(
                "py-3.5 rounded-[24px] text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                activeTab === 'student' 
                  ? "bg-white text-[#4F378B] shadow-lg shadow-purple-900/5 scale-[1.02]" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              <User className="h-4 w-4" />
              {t('student_login')}
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={clsx(
                "py-3.5 rounded-[24px] text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                activeTab === 'staff' 
                  ? "bg-white text-[#4F378B] shadow-lg shadow-purple-900/5 scale-[1.02]" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              <Lock className="h-4 w-4" />
              {t('staff_login')}
            </button>
          </div>

          <div className="px-6 pb-8 pt-2">
            {activeTab === 'staff' ? (
              <form onSubmit={handleStaffLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10 h-full">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#4F378B] transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 focus:border-[#4F378B] focus:ring-4 focus:ring-[#4F378B]/10 transition-all font-medium text-gray-800 placeholder-gray-400 shadow-sm"
                      placeholder="admin@school.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('password')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10 h-full">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#4F378B] transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 focus:border-[#4F378B] focus:ring-4 focus:ring-[#4F378B]/10 transition-all font-medium text-gray-800 placeholder-gray-400 shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#4F378B] text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-[#4F378B]/25 hover:bg-[#6750A4] hover:shadow-[#4F378B]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : t('login_button')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleStudentLogin} className="space-y-5">
                <div className="bg-blue-50/80 p-4 rounded-2xl mb-6 flex gap-3 items-start border border-blue-100">
                  <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    {t('student_login_info')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Siswa</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10 h-full">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#4F378B] transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 focus:border-[#4F378B] focus:ring-4 focus:ring-[#4F378B]/10 transition-all font-medium text-gray-800 placeholder-gray-400 shadow-sm"
                      placeholder={t('email_placeholder')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('dob')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10 h-full">
                      <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-[#4F378B] transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="w-full h-14 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 focus:border-[#4F378B] focus:ring-4 focus:ring-[#4F378B]/10 transition-all font-medium text-gray-800 placeholder-gray-400 tracking-wider shadow-sm"
                      placeholder="25122005"
                      maxLength={8}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#4F378B] text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-[#4F378B]/25 hover:bg-[#6750A4] hover:shadow-[#4F378B]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : t('login_button')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
