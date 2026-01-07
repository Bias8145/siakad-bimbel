import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  CalendarCheck, 
  BookOpen, 
  TrendingUp,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendanceToday: 0,
    activeClasses: 0,
    avgScore: 0
  });
  const [performanceData, setPerformanceData] = useState<{name: string, score: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Total Students (Real Count)
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      // 2. Attendance Today (Real Count)
      const today = new Date().toISOString().split('T')[0];
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'Present');

      // 3. Active Classes (Real Count)
      const { count: classCount } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true });

      // 4. Performance Data (Real Aggregation)
      const { data: grades } = await supabase
        .from('grades')
        .select('subject, score');
      
      let avg = 0;
      const subjectStats: Record<string, { total: number, count: number }> = {};

      if (grades && grades.length > 0) {
        // Calculate Global Average
        avg = grades.reduce((acc, curr) => acc + Number(curr.score), 0) / grades.length;

        // Calculate Subject Averages
        grades.forEach(g => {
          if (!subjectStats[g.subject]) {
            subjectStats[g.subject] = { total: 0, count: 0 };
          }
          subjectStats[g.subject].total += Number(g.score);
          subjectStats[g.subject].count += 1;
        });

        const chartData = Object.keys(subjectStats).map(subject => ({
          name: subject,
          score: Math.round(subjectStats[subject].total / subjectStats[subject].count)
        }));
        
        setPerformanceData(chartData);
      }

      setStats({
        totalStudents: studentCount || 0,
        attendanceToday: attendanceCount || 0,
        activeClasses: classCount || 0,
        avgScore: Math.round(avg * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceData = [
    { name: t('present'), value: stats.attendanceToday },
    { name: t('absent'), value: Math.max(0, stats.totalStudents - stats.attendanceToday) },
  ];

  const COLORS = ['#6750A4', '#E8DEF8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-20">
      {/* Greeting Card - Premium M3 Style */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#6750A4] to-[#4F378B] dark:from-[#381E72] dark:to-[#21005D] p-8 lg:p-10 text-white shadow-xl shadow-[#6750A4]/20 transition-all duration-500 hover:shadow-[#6750A4]/30">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EADDFF] animate-pulse"></span>
            Admin Dashboard
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">{t('welcome')}</h1>
          <p className="text-[#EADDFF] text-lg max-w-xl leading-relaxed opacity-90">{t('welcome_subtitle')}</p>
        </div>
        
        {/* Subtle Background Watermark */}
        <GraduationCap className="absolute -right-6 -bottom-12 w-64 h-64 text-white opacity-5 rotate-12 pointer-events-none" />
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D0BCFF]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title={t('total_students')} 
          value={stats.totalStudents} 
          icon={Users} 
          color="bg-[#6750A4]" 
          subtext="Siswa Aktif"
        />
        <StatCard 
          title={t('present_today')} 
          value={stats.attendanceToday} 
          icon={CalendarCheck} 
          color="bg-[#006C4C]" 
          subtext={new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
        />
        <StatCard 
          title={t('active_classes')} 
          value={stats.activeClasses} 
          icon={BookOpen} 
          color="bg-[#9A25AE]" 
          subtext="Jadwal Terdaftar"
        />
        <StatCard 
          title={t('avg_performance')} 
          value={stats.avgScore > 0 ? `${stats.avgScore}` : '-'} 
          icon={TrendingUp} 
          color="bg-[#B3261E]" 
          subtext="Seluruh Mapel"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Attendance Chart */}
        <div className="m3-card p-6 lg:p-8 flex flex-col h-[400px]">
          <h3 className="text-xl font-bold text-[#1D192B] dark:text-[#E6E1E5] mb-6 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E8DEF8] dark:bg-[#4A4458] text-[#1D192B] dark:text-[#EADDFF]">
              <CalendarCheck className="h-5 w-5" />
            </div>
            {t('attendance_overview')}
          </h3>
          <div className="flex-1 w-full min-h-0">
            {stats.totalStudents > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50 rounded-[24px] border border-dashed border-[#CAC4D0] dark:border-[#49454F]">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <span>Belum ada data siswa</span>
              </div>
            )}
          </div>
          {stats.totalStudents > 0 && (
            <div className="flex justify-center gap-8 mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6750A4]"></div>
                <span>{t('present')} ({stats.attendanceToday})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E8DEF8]"></div>
                <span>{t('absent')} ({Math.max(0, stats.totalStudents - stats.attendanceToday)})</span>
              </div>
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div className="m3-card p-6 lg:p-8 flex flex-col h-[400px]">
          <h3 className="text-xl font-bold text-[#1D192B] dark:text-[#E6E1E5] mb-6 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FFD8E4] dark:bg-[#5C3F4B] text-[#31111D] dark:text-[#FFD8E4]">
              <TrendingUp className="h-5 w-5" />
            </div>
            {t('subject_performance')}
          </h3>
          <div className="flex-1 w-full min-h-0">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F3EDF7', opacity: 0.5 }} 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Bar dataKey="score" fill="url(#colorScore)" radius={[12, 12, 0, 0]} />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6750A4" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#6750A4" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50 rounded-[24px] border border-dashed border-[#CAC4D0] dark:border-[#49454F]">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <span>{t('no_grades')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtext }: { title: string, value: string | number, icon: any, color: string, subtext?: string }) {
  return (
    <div className="m3-card overflow-hidden hover:translate-y-[-4px] transition-all duration-300 group cursor-default">
      <div className="p-5 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-[#1D192B] dark:text-[#E6E1E5] tracking-tight">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-current"></span>{subtext}</p>}
          </div>
          <div className={`rounded-2xl p-3 ${color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
