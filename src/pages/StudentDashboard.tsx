import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grade, Schedule, Attendance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, GraduationCap, Clock, User, Printer, Layout, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateLocale } from 'date-fns/locale';
import { clsx } from 'clsx';

export default function StudentDashboard() {
  const { student, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'profile'>('overview');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;

    const fetchData = async () => {
      try {
        // Fetch Grades
        const { data: gradesData } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', student.id)
          .order('date', { ascending: false });
        
        // Fetch Schedule
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('*')
          .eq('grade_level', student.grade_level)
          .order('day_of_week');

        // Fetch Attendance
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id)
          .order('date', { ascending: false })
          .limit(10);

        setGrades(gradesData || []);
        setSchedules(scheduleData || []);
        setAttendance(attendanceData || []);
      } catch (error) {
        console.error('Error fetching student data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student]);

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to Landing Page
  };

  const handlePrint = () => {
    window.print();
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#FEF7FF] p-4 sm:p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 no-print">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#EADDFF] flex items-center justify-center text-[#21005D] font-bold text-xl">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1D1B20]">{student.full_name}</h1>
            <p className="text-sm text-gray-500">{student.grade_level} • {student.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 rounded-full hover:bg-red-50 text-red-500 transition-colors"
          title={t('sign_out')}
        >
          <LogOut className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Tabs */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 overflow-x-auto pb-2 no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={clsx(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeTab === 'overview' ? "bg-[#4F378B] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <Layout className="h-4 w-4 inline-block mr-2" />
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('academics')}
          className={clsx(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeTab === 'academics' ? "bg-[#4F378B] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <GraduationCap className="h-4 w-4 inline-block mr-2" />
          Akademik
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={clsx(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeTab === 'profile' ? "bg-[#4F378B] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <UserCircle className="h-4 w-4 inline-block mr-2" />
          Profil Saya
        </button>
      </div>

      <main className="max-w-6xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Card */}
            <div className="lg:col-span-3 bg-gradient-to-r from-[#4F378B] to-[#6750A4] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Selamat Datang, {student.full_name.split(' ')[0]}!</h2>
                <p className="text-blue-100">Tetap semangat belajar dan raih prestasimu.</p>
              </div>
              <GraduationCap className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white opacity-10 rotate-12" />
            </div>

            {/* Recent Attendance */}
            <div className="lg:col-span-2 m3-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFD8E4] p-2 rounded-xl">
                  <Clock className="h-6 w-6 text-[#31111D]" />
                </div>
                <h2 className="text-xl font-bold">{t('my_attendance')} (Terbaru)</h2>
              </div>
              <div className="overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-50">
                    {attendance.slice(0, 5).map(record => (
                      <tr key={record.id}>
                        <td className="py-3 text-sm font-medium">
                          {format(new Date(record.date), 'dd MMMM yyyy', { locale: dateLocale })}
                        </td>
                        <td className="py-3 text-right">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            record.status === 'Present' && "bg-green-100 text-green-700",
                            record.status === 'Sick' && "bg-blue-100 text-blue-700",
                            record.status === 'Permission' && "bg-yellow-100 text-yellow-700",
                            record.status === 'Alpha' && "bg-red-100 text-red-700",
                          )}>
                            {record.status === 'Present' ? 'Hadir' : record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {attendance.length === 0 && <p className="text-gray-500 text-center py-4">Belum ada data.</p>}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="m3-card p-6 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#EADDFF] flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#21005D]">{grades.length}</span>
              </div>
              <h3 className="font-bold text-gray-900">Total Ujian</h3>
              <p className="text-sm text-gray-500">Semester Ini</p>
            </div>
          </div>
        )}

        {/* Academics Tab */}
        {activeTab === 'academics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Grades Section */}
            <section className="m3-card p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#EADDFF] p-2 rounded-xl">
                    <GraduationCap className="h-6 w-6 text-[#21005D]" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('my_grades')}</h2>
                </div>
                <button 
                  onClick={handlePrint}
                  className="m3-button m3-button-secondary py-2 px-4 text-sm no-print"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Laporan
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="py-3 font-bold text-gray-600">Mata Pelajaran</th>
                      <th className="py-3 font-bold text-gray-600">Tipe</th>
                      <th className="py-3 font-bold text-gray-600">Tanggal</th>
                      <th className="py-3 font-bold text-gray-600 text-right">Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {grades.map(grade => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="py-4 font-medium text-gray-900">{grade.subject}</td>
                        <td className="py-4 text-sm text-gray-500">{grade.exam_type}</td>
                        <td className="py-4 text-sm text-gray-500">{format(new Date(grade.date), 'dd/MM/yyyy')}</td>
                        <td className="py-4 text-right">
                          <span className={clsx(
                            "font-bold text-lg",
                            grade.score >= 85 ? "text-green-600" : 
                            grade.score >= 70 ? "text-[#4F378B]" : "text-red-500"
                          )}>
                            {grade.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {grades.length === 0 && <p className="text-center py-8 text-gray-500">Belum ada data nilai.</p>}
              </div>
            </section>

            {/* Schedule Section */}
            <section className="no-print">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#EADDFF] p-2 rounded-xl">
                  <Calendar className="h-6 w-6 text-[#21005D]" />
                </div>
                <h2 className="text-2xl font-bold">{t('my_schedule')}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="glass-card p-5 border-l-4 border-l-[#4F378B]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4F378B] bg-[#EADDFF] px-2 py-1 rounded-md">
                        {schedule.day_of_week}
                      </span>
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {schedule.start_time.slice(0, 5)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1D1B20] mb-1">{schedule.subject}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      {schedule.teacher_name}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="m3-card p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-[#EADDFF] rounded-full flex items-center justify-center text-4xl font-bold text-[#21005D] mx-auto mb-4">
                  {student.full_name.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold">{student.full_name}</h2>
                <p className="text-gray-500">Siswa Aktif • {student.grade_level}</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{student.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                    <p className="text-gray-900 font-medium">
                      {student.date_of_birth ? format(new Date(student.date_of_birth), 'dd MMMM yyyy', { locale: dateLocale }) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Orang Tua</label>
                    <p className="text-gray-900 font-medium">{student.parent_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kontak Orang Tua</label>
                    <p className="text-gray-900 font-medium">{student.parent_phone || '-'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                    <UserCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Jika terdapat kesalahan data profil, silakan hubungi staf administrasi atau wali kelas untuk melakukan perubahan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
