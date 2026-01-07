import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grade, Schedule, Attendance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, GraduationCap, Clock, User, Printer, Layout, 
  UserCircle, Upload, Globe, MessageCircle, ArrowRight,
  TrendingUp, Activity, CheckCircle2, Star, MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { id as dateLocale } from 'date-fns/locale';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { openWhatsApp, ADMIN_PHONE } from '../utils/whatsapp';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

export default function StudentDashboard() {
  const { student, logout, loginStudent } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'profile'>('overview');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [nextClass, setNextClass] = useState<Schedule | null>(null);
  const [avgScore, setAvgScore] = useState(0);
  
  // Chart Data States
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
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

          // Group by Subject for Bar Chart
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

          // Sort today's classes by time
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

        // Process Attendance for Pie Chart
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
            { name: t('present'), value: stats.Present, color: '#22c55e' }, // Green
            { name: t('permission'), value: stats.Permission, color: '#eab308' }, // Yellow
            { name: t('sick'), value: stats.Sick, color: '#3b82f6' }, // Blue
            { name: t('alpha'), value: stats.Alpha, color: '#ef4444' }, // Red
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
    <div className="min-h-screen bg-[#FEF7FF] p-4 sm:p-8 font-sans pb-32 lg:pb-8">
      {/* Header - Responsive Layout Fix */}
      <header className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 no-print">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto text-center sm:text-left">
            <div className="h-20 w-20 rounded-full bg-[#EADDFF] flex items-center justify-center text-[#21005D] font-bold text-2xl overflow-hidden border-4 border-white shadow-lg shadow-purple-100 flex-shrink-0">
              {student.photo_url ? (
                <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
              ) : (
                student.full_name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1D1B20] tracking-tight">{student.full_name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 mt-1">
                <span className="bg-gray-100 px-3 py-1 rounded-full font-medium border border-gray-200">{student.grade_level}</span>
                <span className="text-gray-300">•</span>
                <span className="text-[#4F378B] font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {student.branch || 'Pusat'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions Section - Grid on Mobile, Row on Desktop */}
          <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => openWhatsApp(ADMIN_PHONE, `Halo Admin Bimbel Cendekia, saya ${student.full_name} (Siswa) ingin bertanya.`)}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-105 transition-all w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Hubungi Admin</span>
            </button>
            
            <button 
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'EN' : 'ID'}
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              <span className="sm:inline">{t('sign_out')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Scrollable Fix */}
      <div className="max-w-7xl mx-auto mb-8 no-print">
        <div className="flex justify-start sm:justify-center overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 bg-white/50 p-1.5 rounded-full border border-white/60 backdrop-blur-sm">
            {[
              { id: 'overview', icon: Layout, label: t('tab_overview') },
              { id: 'academics', icon: GraduationCap, label: t('tab_academics') },
              { id: 'profile', icon: UserCircle, label: t('tab_profile') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id 
                    ? "bg-[#4F378B] text-white shadow-lg shadow-[#4F378B]/20 scale-100" 
                    : "text-gray-500 hover:bg-white hover:text-[#4F378B]"
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
            <div className="w-10 h-10 border-4 border-[#4F378B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* ================= OVERVIEW TAB ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Top Row: Welcome & Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Welcome Card */}
                  <div className="md:col-span-2 bg-gradient-to-br from-[#4F378B] to-[#21005D] rounded-[32px] p-8 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-100 mb-3 border border-white/10">
                        <Clock className="h-3 w-3" />
                        {getTimeBasedGreeting()}
                      </div>
                      <h2 className="text-3xl font-bold mb-2">{student.full_name.split(' ')[0]}!</h2>
                      <p className="text-purple-100 opacity-90 mb-6 max-w-md">{t('hello_student')}</p>
                      <div className="flex gap-3 flex-wrap">
                        <button 
                          onClick={() => setActiveTab('academics')}
                          className="bg-white text-[#4F378B] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-lg"
                        >
                          {t('my_grades')} <ArrowRight className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openWhatsApp(ADMIN_PHONE, 'Halo Admin, saya ingin konsultasi akademik.')}
                          className="bg-[#4F378B]/50 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#4F378B]/70 transition-all"
                        >
                          Konsultasi
                        </button>
                      </div>
                    </div>
                    <GraduationCap className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                  </div>

                  {/* Next Class Widget */}
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <div className="bg-orange-100 p-2.5 rounded-xl">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">{t('next_class')}</h3>
                    </div>
                    
                    {nextClass ? (
                      <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <p className="text-2xl font-bold text-[#1D1B20] mb-1 line-clamp-1">{nextClass.subject}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <User className="h-3 w-3" /> <span>{nextClass.teacher_name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {nextClass.start_time.slice(0, 5)}
                          </div>
                          {nextClass.room && (
                            <div className="text-xs font-medium text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {nextClass.room}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-50 p-3 rounded-full mb-2">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-gray-900 font-bold text-sm">Selesai!</p>
                        <p className="text-gray-400 text-xs">{t('no_upcoming_class')}</p>
                      </div>
                    )}
                    {/* Decorative Circle */}
                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-orange-50 rounded-full opacity-50"></div>
                  </div>
                </div>

                {/* Middle Row: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Academic Performance Chart */}
                  <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        {t('subject_performance')}
                      </h3>
                      <div className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        Rata-rata: {avgScore}
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      {subjectPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={subjectPerformance} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                              dataKey="subject" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#6b7280', fontSize: 11}} 
                              dy={10}
                            />
                            <YAxis 
                              hide 
                              domain={[0, 100]} 
                            />
                            <RechartsTooltip 
                              cursor={{ fill: '#f9fafb' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                              {subjectPerformance.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score >= 85 ? '#22c55e' : entry.score >= 70 ? '#3b82f6' : '#eab308'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <Activity className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-sm">Belum ada data nilai</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Stats Chart */}
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        {t('attendance_rate')}
                      </h3>
                    </div>
                    
                    <div className="flex-1 relative flex items-center justify-center">
                      {attendanceStats.length > 0 && attendanceStats.some(s => s.value > 0) ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={attendanceStats}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {attendanceStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-gray-400 text-sm">
                          Belum ada data absensi
                        </div>
                      )}
                      
                      {/* Center Text */}
                      {attendanceStats.length > 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-3xl font-bold text-gray-900">{attendancePercentage}%</span>
                          <span className="text-xs text-gray-500 font-medium">Hadir</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {attendanceStats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                          <span>{stat.name}: {stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Recent Activity & Motivation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Attendance List */}
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        {t('recent_attendance')}
                      </h3>
                      <button onClick={() => setActiveTab('academics')} className="text-xs font-bold text-[#4F378B] hover:underline">
                        Lihat Semua
                      </button>
                    </div>
                    <div className="space-y-3">
                      {attendance.length > 0 ? attendance.slice(0, 3).map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={clsx("w-2 h-10 rounded-full", 
                               record.status === 'Present' ? "bg-green-500" :
                               record.status === 'Sick' ? "bg-blue-500" : "bg-red-500"
                            )}></div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {format(new Date(record.date), 'EEEE, dd MMM', { locale: dateLocale })}
                              </p>
                              <p className="text-xs text-gray-500">{record.status === 'Present' ? 'Tepat Waktu' : '-'}</p>
                            </div>
                          </div>
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            record.status === 'Present' ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                          )}>
                            {getStatusLabel(record.status)}
                          </span>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-gray-400 text-sm">Belum ada data absensi</div>
                      )}
                    </div>
                  </div>

                  {/* Motivation Card */}
                  <div className="bg-[#FFD8E4] rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                      <div className="bg-white/40 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Star className="h-6 w-6 text-[#31111D]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#31111D] mb-2">Tetap Semangat!</h3>
                      <p className="text-[#31111D]/80 text-sm mb-6 max-w-xs leading-relaxed">
                        "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan, Anda dapat mengubah dunia."
                      </p>
                      <button 
                        onClick={() => openWhatsApp(ADMIN_PHONE, 'Halo Admin, saya butuh motivasi belajar.')}
                        className="bg-white text-[#31111D] px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition-transform w-fit"
                      >
                        Hubungi Mentor
                      </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute right-0 top-0 w-40 h-40 bg-white/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="absolute left-0 bottom-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl transform -translate-x-10 translate-y-10"></div>
                  </div>
                </div>

              </div>
            )}

            {/* ================= ACADEMICS TAB ================= */}
            {activeTab === 'academics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Grades Section */}
                <section className="m3-card p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#EADDFF] p-3 rounded-2xl">
                        <GraduationCap className="h-6 w-6 text-[#21005D]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('my_grades')}</h2>
                        <p className="text-sm text-gray-500">Riwayat nilai ujian & tugas</p>
                      </div>
                    </div>
                    <button 
                      onClick={handlePrint}
                      className="m3-button m3-button-secondary py-2.5 px-5 text-sm no-print w-full sm:w-auto"
                    >
                      <Printer className="h-4 w-4" />
                      {t('print_report')}
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">{t('subject')}</th>
                          <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">{t('exam_type')}</th>
                          <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">{t('date')}</th>
                          <th className="py-4 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">{t('score')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 bg-white">
                        {grades.length > 0 ? grades.map(grade => (
                          <tr key={grade.id} className="hover:bg-purple-50/30 transition-colors">
                            <td className="py-4 px-6 font-bold text-gray-900">{grade.subject}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold uppercase text-gray-500">
                                {grade.exam_type}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                              {format(new Date(grade.date), 'dd MMM yyyy', { locale: dateLocale })}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={clsx(
                                "font-bold text-lg px-3 py-1 rounded-lg",
                                grade.score >= 85 ? "bg-green-50 text-green-700" : 
                                grade.score >= 70 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                              )}>
                                {grade.score}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-gray-400">
                              {t('no_grades')}
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
                    <div className="bg-[#EADDFF] p-3 rounded-2xl">
                      <Calendar className="h-6 w-6 text-[#21005D]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('my_schedule')}</h2>
                  </div>
                  
                  {schedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {schedules.map(schedule => (
                        <div key={schedule.id} className="glass-card p-6 border-l-[6px] border-l-[#4F378B] hover:translate-y-[-4px] transition-transform duration-300">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4F378B] bg-[#EADDFF] px-2.5 py-1 rounded-lg">
                              {schedule.day_of_week}
                            </span>
                            <span className="text-sm font-bold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                              <Clock className="h-3.5 w-3.5" />
                              {schedule.start_time.slice(0, 5)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#1D1B20] mb-2">{schedule.subject}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <User className="h-4 w-4 text-gray-400" />
                            {schedule.teacher_name}
                          </div>
                          {schedule.room && (
                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                              <span>Ruangan: {schedule.room}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel p-10 text-center text-gray-500 rounded-3xl border-dashed border-2 border-gray-200">
                      Jadwal belum tersedia untuk kelas ini.
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ================= PROFILE TAB ================= */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="m3-card p-8 sm:p-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#4F378B] to-[#6750A4] opacity-10"></div>
                  
                  <div className="text-center mb-10 relative z-10">
                    <div className="relative w-36 h-36 mx-auto mb-5 group">
                      <div className="w-36 h-36 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl flex items-center justify-center">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl font-bold text-[#21005D]">{student.full_name.charAt(0)}</span>
                        )}
                      </div>
                      
                      {/* Upload Button Overlay */}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full backdrop-blur-sm">
                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center">
                          <Upload className="h-8 w-8 mb-1" />
                          <span className="text-xs font-bold">Ubah Foto</span>
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
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full z-20">
                          <div className="w-10 h-10 border-4 border-[#4F378B] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900">{student.full_name}</h2>
                    <div className="flex justify-center gap-2 mt-2">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide border border-green-200">
                        {t('active')}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide border border-gray-200">
                        {student.grade_level}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t('email')}</label>
                        <p className="text-gray-900 font-bold text-lg break-all">{student.email}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t('dob')}</label>
                        <p className="text-gray-900 font-bold text-lg">
                          {student.date_of_birth ? format(new Date(student.date_of_birth), 'dd MMMM yyyy', { locale: dateLocale }) : '-'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t('parent_name')}</label>
                        <p className="text-gray-900 font-bold text-lg">{student.parent_name || '-'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t('parent_phone')}</label>
                        <p className="text-gray-900 font-bold text-lg">{student.parent_phone || '-'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <div className="bg-blue-50 p-5 rounded-2xl flex gap-4 border border-blue-100">
                        <UserCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-blue-900 font-bold text-sm mb-1">Info Data Diri</h4>
                          <p className="text-sm text-blue-800 leading-relaxed opacity-90">
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
