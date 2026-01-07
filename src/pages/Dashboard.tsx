import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  CalendarCheck, 
  BookOpen, 
  TrendingUp,
  AlertCircle
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

  const COLORS = ['#2563eb', '#e5e7eb'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 lg:p-8 rounded-[32px] bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-blue-100/50 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{t('welcome')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-base lg:text-lg">{t('welcome_subtitle')}</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-100/50 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title={t('total_students')} 
          value={stats.totalStudents} 
          icon={Users} 
          color="bg-blue-500" 
          subtext="Siswa Aktif"
        />
        <StatCard 
          title={t('present_today')} 
          value={stats.attendanceToday} 
          icon={CalendarCheck} 
          color="bg-green-500" 
          subtext={new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
        />
        <StatCard 
          title={t('active_classes')} 
          value={stats.activeClasses} 
          icon={BookOpen} 
          color="bg-purple-500" 
          subtext="Jadwal Terdaftar"
        />
        <StatCard 
          title={t('avg_performance')} 
          value={stats.avgScore > 0 ? `${stats.avgScore}` : '-'} 
          icon={TrendingUp} 
          color="bg-orange-500" 
          subtext="Seluruh Mapel"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Attendance Chart */}
        <div className="glass-card p-6 lg:p-8 flex flex-col">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-gray-400" />
            {t('attendance_overview')}
          </h3>
          <div className="h-64 lg:h-72 flex-1 w-full">
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
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <span>Belum ada data siswa</span>
              </div>
            )}
          </div>
          {stats.totalStudents > 0 && (
            <div className="flex justify-center gap-8 mt-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-600/50"></div>
                <span>{t('present')} ({stats.attendanceToday})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                <span>{t('absent')} ({Math.max(0, stats.totalStudents - stats.attendanceToday)})</span>
              </div>
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div className="glass-card p-6 lg:p-8 flex flex-col">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            {t('subject_performance')}
          </h3>
          <div className="h-64 lg:h-72 flex-1 w-full">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
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
                    cursor={{ fill: '#f9fafb' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="score" fill="url(#colorScore)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F378B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4F378B" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
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
    <div className="glass-card overflow-hidden hover:translate-y-[-4px] transition-all duration-300 group">
      <div className="p-5 lg:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>}
          </div>
          <div className={`rounded-2xl p-3 ${color} shadow-lg shadow-${color.replace('bg-', '')}/30 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
