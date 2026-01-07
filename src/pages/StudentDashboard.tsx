import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grade, Schedule, Attendance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, GraduationCap, Clock, User, Layout, 
  UserCircle, Upload, MessageCircle, MapPin, Moon, Sun,
  Sparkles, BookOpen, TrendingUp, Activity, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { id as dateLocale } from 'date-fns/locale';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { openWhatsApp, ADMIN_PHONE } from '../utils/whatsapp';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Lottie from 'lottie-react';
import { useTheme } from '../contexts/ThemeContext';

export default function StudentDashboard() {
  const { student, logout } = useAuth();
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'profile'>('overview');
  const [loading, setLoading] = useState(true);
  const [nextClass, setNextClass] = useState<Schedule | null>(null);
  const [lottieData, setLottieData] = useState<any>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    fetch('https://lottie.host/88001712-1403-4674-9844-325d7065091a/82w9X0y1yI.json')
      .then(res => res.json())
      .then(data => setLottieData(data))
      .catch(err => console.error(err));

    if (!student) return;

    const fetchData = async () => {
      try {
        // Grades & Performance
        const { data: gradesData } = await supabase.from('grades').select('*').eq('student_id', student.id);
        if (gradesData) {
          setGrades(gradesData);
          const subjectMap: Record<string, { total: number, count: number }> = {};
          gradesData.forEach(g => {
            if (!subjectMap[g.subject]) subjectMap[g.subject] = { total: 0, count: 0 };
            subjectMap[g.subject].total += Number(g.score);
            subjectMap[g.subject].count += 1;
          });
          setSubjectPerformance(Object.keys(subjectMap).map(subj => ({
            subject: subj,
            score: Math.round(subjectMap[subj].total / subjectMap[subj].count)
          })));
        }

        // Schedule
        const { data: scheduleData } = await supabase.from('schedules').select('*').eq('grade_level', student.grade_level);
        if (scheduleData) {
          setSchedules(scheduleData);
          const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = daysMap[new Date().getDay()];
          const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
          const upcoming = scheduleData.filter(s => s.day_of_week === today && s.start_time > nowTime).sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
          setNextClass(upcoming || null);
        }

        // Attendance
        const { data: attendanceData } = await supabase.from('attendance').select('*').eq('student_id', student.id);
        if (attendanceData) {
          const present = attendanceData.filter(a => a.status === 'Present').length;
          setAttendancePercentage(attendanceData.length > 0 ? Math.round((present / attendanceData.length) * 100) : 0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student]);

  if (!student) return null;

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-12 gap-4">
            {/* Next Class Widget */}
            <div className="col-span-12 md:col-span-7 bg-white dark:bg-[#1D1B20] rounded-[24px] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                 <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
                   <Clock className="h-5 w-5 text-orange-600" />
                 </div>
                 <h3 className="font-bold text-[#1D1B20] dark:text-white">Kelas Berikutnya</h3>
               </div>
               
               {nextClass ? (
                 <div className="bg-[#FFF8F6] dark:bg-orange-900/10 rounded-2xl p-4 border border-orange-100 dark:border-white/5 flex justify-between items-center">
                   <div>
                     <p className="font-bold text-lg text-[#1D1B20] dark:text-white">{nextClass.subject}</p>
                     <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                       <User className="h-3 w-3" /> {nextClass.teacher_name}
                     </p>
                   </div>
                   <div className="text-right">
                     <div className="bg-white dark:bg-white/10 px-3 py-1 rounded-lg text-sm font-bold text-orange-600 dark:text-orange-300 shadow-sm">
                       {nextClass.start_time.slice(0,5)}
                     </div>
                     <p className="text-xs text-gray-400 mt-1">{nextClass.room || 'R. TBD'}</p>
                   </div>
                 </div>
               ) : (
                 <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center border border-dashed border-gray-200 dark:border-white/10">
                   <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                   <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Selesai untuk hari ini!</p>
                 </div>
               )}
            </div>

            {/* Attendance Stat */}
            <div className="col-span-12 md:col-span-5 bg-white dark:bg-[#1D1B20] rounded-[24px] p-5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#1D1B20] dark:text-white">Kehadiran</h3>
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-[#1D1B20] dark:text-white">{attendancePercentage}%</span>
                <span className="text-sm text-gray-500 mb-1.5">Hadir</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="col-span-12 bg-white dark:bg-[#1D1B20] rounded-[24px] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                 <TrendingUp className="h-5 w-5 text-[#6750A4]" />
                 <h3 className="font-bold text-[#1D1B20] dark:text-white">Statistik Nilai</h3>
               </div>
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={subjectPerformance}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6750A4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6750A4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="score" stroke="#6750A4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        );
      case 'academics':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1D1B20] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-lg mb-4 text-[#1D1B20] dark:text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Riwayat Nilai
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5">
                      <th className="text-left py-3 text-gray-500 font-medium">Mapel</th>
                      <th className="text-left py-3 text-gray-500 font-medium">Tipe</th>
                      <th className="text-right py-3 text-gray-500 font-medium">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(g => (
                      <tr key={g.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                        <td className="py-3 font-medium text-[#1D1B20] dark:text-white">{g.subject}</td>
                        <td className="py-3 text-gray-500">{g.exam_type}</td>
                        <td className="py-3 text-right font-bold text-[#6750A4]">{g.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1D1B20] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-lg mb-4 text-[#1D1B20] dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Jadwal Pelajaran
              </h3>
              <div className="space-y-3">
                {schedules.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div>
                      <p className="font-bold text-[#1D1B20] dark:text-white">{s.subject}</p>
                      <p className="text-xs text-gray-500">{s.day_of_week}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-[#6750A4] bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
                        {s.start_time.slice(0,5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white dark:bg-[#1D1B20] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden mb-3 border-4 border-white shadow-lg">
                {student.photo_url ? <img src={student.photo_url} className="w-full h-full object-cover" /> : null}
              </div>
              <h2 className="text-xl font-bold text-[#1D1B20] dark:text-white">{student.full_name}</h2>
              <p className="text-gray-500">{student.grade_level}</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Email</p>
                <p className="font-medium text-[#1D1B20] dark:text-white">{student.email}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tanggal Lahir</p>
                <p className="font-medium text-[#1D1B20] dark:text-white">{student.date_of_birth}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Orang Tua</p>
                <p className="font-medium text-[#1D1B20] dark:text-white">{student.parent_name} ({student.parent_phone})</p>
              </div>
              
              <button 
                onClick={() => openWhatsApp(ADMIN_PHONE, `Halo Admin, saya siswa ${student.full_name} ingin menanyakan tentang data profil.`)}
                className="w-full m3-btn m3-btn-tonal mt-4"
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi Admin
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF7FF] dark:bg-[#141218] font-sans pb-24 transition-colors duration-300">
      
      {/* Compact Header */}
      <header className="bg-white/80 dark:bg-[#1D1B20]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#EADDFF] dark:bg-[#4F378B] flex items-center justify-center overflow-hidden border border-gray-100">
              {student.photo_url ? <img src={student.photo_url} className="w-full h-full object-cover" /> : student.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1D1B20] dark:text-white leading-tight">{student.full_name}</h1>
              <p className="text-xs text-gray-500">{student.grade_level} • {student.branch || 'Pusat'}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
             </button>
             <button onClick={() => logout()} className="p-2 rounded-full hover:bg-red-50 text-red-500">
                <LogOut className="h-5 w-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Welcome Card (Compact) with Subtle Icon Background */}
        <div className="bg-gradient-to-r from-[#6750A4] to-[#7D5260] dark:from-[#381E72] dark:to-[#4A041D] rounded-[28px] p-6 text-white shadow-lg mb-6 relative overflow-hidden flex items-center justify-between">
          
          {/* Subtle Background Icon */}
          <div className="absolute -left-6 -bottom-6 opacity-10 rotate-12 pointer-events-none">
            <GraduationCap className="h-48 w-48 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Selamat Datang</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Halo, {student.full_name.split(' ')[0]}!</h2>
            <p className="text-sm opacity-80 max-w-xs">Siap untuk belajar hal baru hari ini?</p>
          </div>
          <div className="w-24 h-24 relative z-10">
             {lottieData && <Lottie animationData={lottieData} loop={true} />}
          </div>
          {/* Decor */}
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10"></div>
        </div>

        {renderContent()}
      </main>

      {/* Floating Bottom Nav (Mobile Only) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1D1B20]/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-8 z-50 border border-white/10">
        <button onClick={() => setActiveTab('overview')} className={clsx("p-2 rounded-full transition-all", activeTab === 'overview' ? "bg-white/20 dark:bg-black/10 scale-110" : "opacity-50")}>
          <Layout className="h-6 w-6" />
        </button>
        <button onClick={() => setActiveTab('academics')} className={clsx("p-2 rounded-full transition-all", activeTab === 'academics' ? "bg-white/20 dark:bg-black/10 scale-110" : "opacity-50")}>
          <GraduationCap className="h-6 w-6" />
        </button>
        <button onClick={() => setActiveTab('profile')} className={clsx("p-2 rounded-full transition-all", activeTab === 'profile' ? "bg-white/20 dark:bg-black/10 scale-110" : "opacity-50")}>
          <UserCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
