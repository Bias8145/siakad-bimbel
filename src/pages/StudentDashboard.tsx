import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grade, Schedule, Attendance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, GraduationCap, Clock, User, Printer, Layout, 
  UserCircle, Upload, Globe, MessageCircle, ArrowRight,
  TrendingUp, Activity, CheckCircle2, Star, MapPin, Moon, Sun,
  Sparkles, BookOpen, Award
} from 'lucide-react';
import { format } from 'date-fns';
import { id as dateLocale } from 'date-fns/locale';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { openWhatsApp, ADMIN_PHONE } from '../utils/whatsapp';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import Lottie from 'lottie-react';
import { useTheme } from '../contexts/ThemeContext';

export default function StudentDashboard() {
  const { student, logout, loginStudent } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'profile'>('overview');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [nextClass, setNextClass] = useState<Schedule | null>(null);
  const [avgScore, setAvgScore] = useState(0);
  const [lottieData, setLottieData] = useState<any>(null);
  
  // Chart Data States
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    // Fetch Lottie JSON - Using a more "Education" themed animation
    fetch('https://lottie.host/88001712-1403-4674-9844-325d7065091a/82w9X0y1yI.json')
      .then(res => res.json())
      .then(data => setLottieData(data))
      .catch(err => console.error("Lottie load error", err));

    if (!student) return;

    const fetchData = async () => {
      try {
        // 1. Fetch Grades
        const { data: gradesData } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', student.id)
          .order('date', { ascending: false });
        
        // Process Grades for Charts
        if (gradesData && gradesData.length > 0) {
          const total = gradesData.reduce((acc, curr) => acc + Number(curr.score), 0);
          setAvgScore(Math.round(total / gradesData.length));

          // Group by Subject for Area Chart
          const subjectMap: Record<string, { total: number, count: number }> = {};
          gradesData.forEach(g => {
            if (!subjectMap[g.subject]) subjectMap[g.subject] = { total: 0, count: 0 };
            subjectMap[g.subject].total += Number(g.score);
            subjectMap[g.subject].count += 1;
          });

          const chartData = Object.keys(subjectMap).map(subj => ({
            subject: subj,
            score: Math.round(subjectMap[subj].total / subjectMap[subj].count)
          }));
          setSubjectPerformance(chartData);
        }

        // 2. Fetch Schedule
        let query = supabase
          .from('schedules')
          .select('*')
          .eq('grade_level', student.grade_level)
          .order('day_of_week');
        
        if (student.branch) {
          query = query.eq('branch', student.branch);
        }

        const { data: scheduleData } = await query;

        // Determine Next Class
        if (scheduleData) {
          const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = daysMap[new Date().getDay()];
          const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });

          const todayClasses = scheduleData
            .filter(s => s.day_of_week === today)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

          const upcoming = todayClasses.find(s => s.start_time > nowTime);
          setNextClass(upcoming || null);
        }

        // 3. Fetch Attendance
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id)
          .order('date', { ascending: false });

        setAttendance(attendanceData || []);

        if (attendanceData) {
          const stats = { Present: 0, Sick: 0, Permission: 0, Alpha: 0 };
          attendanceData.forEach(a => {
            if (stats[a.status as keyof typeof stats] !== undefined) {
              stats[a.status as keyof typeof stats]++;
            }
          });

          const totalDays = attendanceData.length;
          const presentPercentage = totalDays > 0 ? Math.round((stats.Present / totalDays) * 100) : 0;
          setAttendancePercentage(presentPercentage);

          setAttendanceStats([
            { name: t('present'), value: stats.Present, color: '#22c55e' },
            { name: t('permission'), value: stats.Permission, color: '#eab308' },
            { name: t('sick'), value: stats.Sick, color: '#3b82f6' },
            { name: t('alpha'), value: stats.Alpha, color: '#ef4444' },
          ]);
        }

        setGrades(gradesData || []);
        setSchedules(scheduleData || []);
      } catch (error) {
        console.error('Error fetching student data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student, t]);

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!student || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${student.id}-${Date.now()}.${fileExt}`;
    const filePath = `student-photos/${fileName}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('students')
        .update({ photo_url: data.publicUrl })
        .eq('id', student.id);

      if (updateError) throw updateError;

      loginStudent({ ...student, photo_url: data.publicUrl });
      toast.success('Foto profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Gagal mengunggah foto. Hubungi admin.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Present': return t('present');
      case 'Sick': return t('sick');
      case 'Permission': return t('permission');
      case 'Alpha': return t('alpha');
      default: return status;
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('good_morning');
    if (hour < 15) return t('good_afternoon');
    if (hour < 18) return t('good_evening');
    return t('good_night');
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#FEF7FF] dark:bg-[#141218] p-4 sm:p-8 font-sans pb-32 lg:pb-12 transition-colors duration-300">
      {/* Header - Premium Glass Card */}
      <header className="max-w-7xl mx-auto mb-8 bg-white/80 dark:bg-[#1D1B20]/80 backdrop-blur-xl p-6 rounded-[32px] shadow-lg shadow-purple-900/5 dark:shadow-none border border-white/50 dark:border-white/5 no-print relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto text-center sm:text-left">
            <div className="relative group">
              <div className="h-24 w-24 rounded-[24px] bg-gradient-to-br from-[#EADDFF] to-[#D0BCFF] dark:from-[#4F378B] dark:to-[#381E72] flex items-center justify-center text-[#21005D] dark:text-[#EADDFF] font-bold text-3xl overflow-hidden border-[4px] border-white dark:border-[#2B2930] shadow-xl">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                ) : (
                  student.full_name.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-[#1D1B20] w-6 h-6 rounded-full"></div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-[#1D1B20] dark:text-white tracking-tight mb-1">{student.full_name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
                <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-bold border border-purple-100 dark:border-purple-800">
                  {student.grade_level}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  {student.branch || 'Pusat'}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  Siswa Aktif
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => openWhatsApp(ADMIN_PHONE, `Halo Admin Bimbel Cendekia, saya ${student.full_name} (Siswa) ingin bertanya.`)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-1 transition-all w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Bantuan</span>
            </button>
            
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all font-bold text-xs"
              >
                {language === 'en' ? 'EN' : 'ID'}
              </button>
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Modern Pill Design */}
      <div className="max-w-7xl mx-auto mb-8 no-print">
        <div className="flex justify-center">
          <div className="bg-white/60 dark:bg-[#2B2930]/60 backdrop-blur-md p-1.5 rounded-full border border-white/50 dark:border-white/10 shadow-sm inline-flex gap-1 overflow-x-auto max-w-full">
            {[
              { id: 'overview', icon: Layout, label: t('tab_overview') },
              { id: 'academics', icon: GraduationCap, label: t('tab_academics') },
              { id: 'profile', icon: UserCircle, label: t('tab_profile') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id 
                    ? "bg-[#4F378B] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] shadow-md" 
                    : "text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-[#4F378B] dark:hover:text-white"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#4F378B] dark:border-[#D0BCFF] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* ================= OVERVIEW TAB (Premium Bento Grid) ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Top Row: Hero Welcome & Next Class */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Welcome Card */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-[#6750A4] to-[#4F378B] dark:from-[#381E72] dark:to-[#141218] rounded-[40px] p-8 text-white shadow-2xl shadow-purple-900/20 relative overflow-hidden group border border-white/10">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-purple-50 mb-4 border border-white/10">
                          <Sparkles className="h-3 w-3 text-yellow-300" />
                          {getTimeBasedGreeting()}
                        </div>
                        <h2 className="text-4xl font-bold mb-3 tracking-tight">Halo, {student.full_name.split(' ')[0]}! 👋</h2>
                        <p className="text-purple-100 opacity-90 mb-8 max-w-md text-lg leading-relaxed">{t('hello_student')}</p>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <button 
                          onClick={() => setActiveTab('academics')}
                          className="bg-white text-[#4F378B] px-6 py-3 rounded-2xl text-sm font-bold hover:bg-purple-50 hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                        >
                          <BookOpen className="h-4 w-4" />
                          {t('my_grades')}
                        </button>
                        <button 
                          onClick={() => setActiveTab('profile')}
                          className="bg-purple-800/40 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-purple-800/60 transition-all"
                        >
                          {t('tab_profile')}
                        </button>
                      </div>
                    </div>
                    
                    {/* Lottie Animation */}
                    <div className="absolute right-[-40px] bottom-[-60px] w-80 h-80 opacity-90 pointer-events-none transform group-hover:scale-105 transition-transform duration-700">
                      {lottieData && <Lottie animationData={lottieData} loop={true} />}
                    </div>
                    
                    {/* Background Patterns */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  </div>

                  {/* Next Class Widget */}
                  <div className="bg-white dark:bg-[#1D1B20] rounded-[40px] p-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col relative overflow-hidden group hover:border-[#4F378B]/30 transition-colors">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl">
                          <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('next_class')}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Jangan terlambat ya!</p>
                        </div>
                      </div>
                    </div>
                    
                    {nextClass ? (
                      <div className="relative z-10 flex-1 flex flex-col justify-center bg-orange-50 dark:bg-orange-900/10 rounded-[28px] p-5 border border-orange-100 dark:border-white/5">
                        <p className="text-2xl font-bold text-[#1D1B20] dark:text-white mb-2 line-clamp-1">{nextClass.subject}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <User className="h-4 w-4" /> <span>{nextClass.teacher_name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-orange-200/50 dark:border-white/10">
                          <div className="bg-white dark:bg-white/10 text-orange-700 dark:text-orange-300 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                            <Clock className="h-4 w-4" />
                            {nextClass.start_time.slice(0, 5)}
                          </div>
                          {nextClass.room && (
                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-white/50 dark:bg-white/5 px-3 py-2 rounded-lg">
                              <MapPin className="h-3.5 w-3.5" /> {nextClass.room}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-white/5 rounded-[28px] border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="bg-white dark:bg-white/10 p-4 rounded-full mb-3 shadow-sm">
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">Kelas Selesai!</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_upcoming_class')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Row: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Academic Performance Chart */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#1D1B20] rounded-[40px] p-8 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                          <TrendingUp className="h-6 w-6 text-blue-500" />
                          {t('subject_performance')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Grafik perkembangan nilai per mata pelajaran</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rata-rata</span>
                        <span className="text-2xl font-bold text-[#4F378B] dark:text-[#D0BCFF]">{avgScore}</span>
                      </div>
                    </div>
                    <div className="h-72 w-full">
                      {subjectPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={subjectPerformance}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F378B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4F378B" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" strokeOpacity={0.5} />
                            <XAxis 
                              dataKey="subject" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}} 
                              dy={15}
                            />
                            <YAxis 
                              hide 
                              domain={[0, 100]} 
                            />
                            <RechartsTooltip 
                              cursor={{ stroke: '#4F378B', strokeWidth: 2, strokeDasharray: '5 5' }}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1D1B20', color: '#fff', padding: '12px 16px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#4F378B" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorScore)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-white/5 rounded-3xl">
                          <Activity className="h-10 w-10 mb-3 opacity-20" />
                          <p className="text-sm font-medium">Belum ada data nilai</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Stats Chart */}
                  <div className="bg-white dark:bg-[#1D1B20] rounded-[40px] p-8 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-green-500" />
                        {t('attendance_rate')}
                      </h3>
                    </div>
                    
                    <div className="flex-1 relative flex items-center justify-center">
                      {attendanceStats.length > 0 && attendanceStats.some(s => s.value > 0) ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={attendanceStats}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                              cornerRadius={6}
                            >
                              {attendanceStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#333', color: '#fff' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-gray-400 text-sm bg-gray-50 dark:bg-white/5 p-6 rounded-3xl w-full">
                          Belum ada data absensi
                        </div>
                      )}
                      
                      {/* Center Text */}
                      {attendanceStats.length > 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">{attendancePercentage}%</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mt-1">Hadir</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {attendanceStats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: stat.color }}></div>
                          <span>{stat.name}: <span className="text-gray-900 dark:text-white font-bold">{stat.value}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Recent Activity & Motivation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Attendance List */}
                  <div className="bg-white dark:bg-[#1D1B20] rounded-[40px] p-8 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="h-6 w-6 text-purple-500" />
                        {t('recent_attendance')}
                      </h3>
                      <button onClick={() => setActiveTab('academics')} className="text-xs font-bold text-[#4F378B] dark:text-[#D0BCFF] hover:bg-purple-50 dark:hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
                        Lihat Semua
                      </button>
                    </div>
                    <div className="space-y-4">
                      {attendance.length > 0 ? attendance.slice(0, 3).map(record => (
                        <div key={record.id} className="flex items-center justify-between p-4 rounded-[20px] bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={clsx("w-1.5 h-10 rounded-full", 
                               record.status === 'Present' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" :
                               record.status === 'Sick' ? "bg-blue-500" : "bg-red-500"
                            )}></div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {format(new Date(record.date), 'EEEE, dd MMM', { locale: dateLocale })}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{record.status === 'Present' ? 'Tepat Waktu' : '-'}</p>
                            </div>
                          </div>
                          <span className={clsx(
                            "px-3 py-1.5 rounded-xl text-xs font-bold",
                            record.status === 'Present' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          )}>
                            {getStatusLabel(record.status)}
                          </span>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 dark:bg-white/5 rounded-3xl">Belum ada data absensi</div>
                      )}
                    </div>
                  </div>

                  {/* Motivation Card */}
                  <div className="bg-gradient-to-br from-[#FFD8E4] to-[#FFB7D0] dark:from-[#4A041D] dark:to-[#310212] rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-center min-h-[250px] shadow-lg shadow-pink-200/50 dark:shadow-none">
                    <div className="relative z-10">
                      <div className="bg-white/60 dark:bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md shadow-sm">
                        <Award className="h-7 w-7 text-[#31111D] dark:text-[#FFD8E4]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#31111D] dark:text-[#FFD8E4] mb-3">Tetap Semangat! 🚀</h3>
                      <p className="text-[#31111D]/80 dark:text-[#FFD8E4]/80 text-base mb-6 max-w-sm leading-relaxed font-medium">
                        "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan, Anda dapat mengubah dunia."
                      </p>
                    </div>
                    {/* Decor */}
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/30 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                    <div className="absolute left-0 bottom-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>
                  </div>
                </div>

              </div>
            )}

            {/* ================= ACADEMICS TAB ================= */}
            {activeTab === 'academics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Grades Section */}
                <section className="bg-white dark:bg-[#1D1B20] rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#EADDFF] dark:bg-[#4F378B]/30 p-3.5 rounded-2xl">
                        <GraduationCap className="h-7 w-7 text-[#21005D] dark:text-[#D0BCFF]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('my_grades')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Riwayat nilai ujian & tugas</p>
                      </div>
                    </div>
                    <button 
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors no-print w-full sm:w-auto justify-center"
                    >
                      <Printer className="h-4 w-4" />
                      {t('print_report')}
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                          <th className="py-5 px-6 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('subject')}</th>
                          <th className="py-5 px-6 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('exam_type')}</th>
                          <th className="py-5 px-6 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('date')}</th>
                          <th className="py-5 px-6 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-right">{t('score')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-[#1D1B20]">
                        {grades.length > 0 ? grades.map(grade => (
                          <tr key={grade.id} className="hover:bg-purple-50/30 dark:hover:bg-white/5 transition-colors group">
                            <td className="py-5 px-6 font-bold text-gray-900 dark:text-white group-hover:text-[#4F378B] dark:group-hover:text-[#D0BCFF] transition-colors">{grade.subject}</td>
                            <td className="py-5 px-6 text-sm text-gray-600 dark:text-gray-400">
                              <span className="bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-lg text-xs font-bold uppercase text-gray-500 dark:text-gray-300 tracking-wide border border-gray-200 dark:border-white/5">
                                {grade.exam_type}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {format(new Date(grade.date), 'dd MMM yyyy', { locale: dateLocale })}
                            </td>
                            <td className="py-5 px-6 text-right">
                              <span className={clsx(
                                "font-bold text-sm px-4 py-1.5 rounded-full border",
                                grade.score >= 85 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/50" : 
                                grade.score >= 70 ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50"
                              )}>
                                {grade.score}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="py-16 text-center text-gray-400">
                              <div className="flex flex-col items-center gap-2">
                                <BookOpen className="h-8 w-8 opacity-20" />
                                <span>{t('no_grades')}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Schedule Section */}
                <section className="no-print">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#EADDFF] dark:bg-[#4F378B]/30 p-3 rounded-2xl">
                      <Calendar className="h-6 w-6 text-[#21005D] dark:text-[#D0BCFF]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('my_schedule')}</h2>
                  </div>
                  
                  {schedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {schedules.map(schedule => (
                        <div key={schedule.id} className="bg-white dark:bg-[#1D1B20] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#4F378B] dark:bg-[#D0BCFF]"></div>
                          
                          <div className="flex justify-between items-start mb-4 pl-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4F378B] dark:text-[#D0BCFF] bg-[#EADDFF] dark:bg-[#4F378B]/30 px-3 py-1 rounded-lg">
                              {schedule.day_of_week}
                            </span>
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                              <Clock className="h-3.5 w-3.5" />
                              {schedule.start_time.slice(0, 5)}
                            </span>
                          </div>
                          
                          <div className="pl-3">
                            <h3 className="text-xl font-bold text-[#1D1B20] dark:text-white mb-2 group-hover:text-[#4F378B] dark:group-hover:text-[#D0BCFF] transition-colors">{schedule.subject}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">
                              <User className="h-4 w-4 text-gray-400" />
                              {schedule.teacher_name}
                            </div>
                            {schedule.room && (
                              <div className="pt-3 border-t border-gray-100 dark:border-white/5 text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>Ruangan: {schedule.room}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#1D1B20] p-12 text-center text-gray-500 dark:text-gray-400 rounded-[32px] border-dashed border-2 border-gray-200 dark:border-white/10">
                      <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      Jadwal belum tersedia untuk kelas ini.
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ================= PROFILE TAB ================= */}
            {activeTab === 'profile' && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white dark:bg-[#1D1B20] rounded-[48px] p-8 sm:p-12 relative overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">
                  {/* Background Decor */}
                  <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-r from-[#4F378B] to-[#6750A4] opacity-10 dark:opacity-20"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                  
                  <div className="text-center mb-12 relative z-10">
                    <div className="relative w-40 h-40 mx-auto mb-6 group">
                      <div className="w-40 h-40 rounded-[32px] overflow-hidden bg-white dark:bg-[#2B2930] border-[6px] border-white dark:border-[#2B2930] shadow-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-6xl font-bold text-[#21005D] dark:text-[#D0BCFF]">{student.full_name.charAt(0)}</span>
                        )}
                      </div>
                      
                      {/* Upload Button Overlay */}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-[32px] backdrop-blur-sm transform rotate-3 group-hover:rotate-0">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center">
                          <Upload className="h-8 w-8 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">Ubah Foto</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handlePhotoUpload}
                          disabled={uploading}
                        />
                      </label>
                      
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[32px] z-20">
                          <div className="w-10 h-10 border-4 border-[#4F378B] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{student.full_name}</h2>
                    <div className="flex justify-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-bold uppercase tracking-wide border border-green-200 dark:border-green-900/50 shadow-sm">
                        {t('active')}
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 text-xs font-bold uppercase tracking-wide border border-gray-200 dark:border-white/10 shadow-sm">
                        {student.grade_level}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[24px] border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('email')}</label>
                        <p className="text-gray-900 dark:text-white font-bold text-lg break-all flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {student.email}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[24px] border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('dob')}</label>
                        <p className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {student.date_of_birth ? format(new Date(student.date_of_birth), 'dd MMMM yyyy', { locale: dateLocale }) : '-'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[24px] border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('parent_name')}</label>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">{student.parent_name || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[24px] border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('parent_phone')}</label>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">{student.parent_phone || '-'}</p>
                      </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[24px] flex gap-5 border border-blue-100 dark:border-blue-900/30">
                        <div className="bg-blue-100 dark:bg-blue-800 p-2.5 rounded-xl h-fit">
                          <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                        </div>
                        <div>
                          <h4 className="text-blue-900 dark:text-blue-200 font-bold text-base mb-2">Info Data Diri</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed opacity-90">
                            {t('contact_admin_note')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
