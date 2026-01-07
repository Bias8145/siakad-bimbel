import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grade, Schedule, Attendance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, GraduationCap, Clock, User, Printer, Layout, UserCircle, Upload, Globe, MessageCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateLocale } from 'date-fns/locale';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { openWhatsApp, ADMIN_PHONE } from '../utils/whatsapp';

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
        let query = supabase
          .from('schedules')
          .select('*')
          .eq('grade_level', student.grade_level)
          .order('day_of_week');
        
        if (student.branch) {
          query = query.eq('branch', student.branch);
        }

        const { data: scheduleData } = await query;

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
    navigate('/'); 
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!student || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${student.id}-${Math.now ? Math.now() : Date.now()}.${fileExt}`;
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

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#FEF7FF] p-4 sm:p-8 font-sans pb-24 lg:pb-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 no-print gap-6">
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className="h-16 w-16 rounded-full bg-[#EADDFF] flex items-center justify-center text-[#21005D] font-bold text-2xl overflow-hidden border-4 border-white shadow-lg shadow-purple-100">
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
            ) : (
              student.full_name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1D1B20] tracking-tight">{student.full_name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium">{student.grade_level}</span>
              <span>•</span>
              <span className="text-[#4F378B] font-medium">{student.branch || 'Pusat'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <button 
            onClick={() => openWhatsApp(ADMIN_PHONE, `Halo Admin Bimbel Cendekia, saya ${student.full_name} (Siswa) ingin bertanya.`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-105 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Hubungi Admin</span>
          </button>
          
          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

          <button 
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'EN' : 'ID'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('sign_out')}</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-center sm:justify-start gap-2 overflow-x-auto pb-2 no-print scrollbar-hide">
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
                ? "bg-[#4F378B] text-white shadow-lg shadow-[#4F378B]/20 scale-105" 
                : "bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#4F378B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Welcome Card */}
                <div className="lg:col-span-3 bg-gradient-to-br from-[#4F378B] to-[#21005D] rounded-[32px] p-8 sm:p-10 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden group">
                  <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('welcome')} {student.full_name.split(' ')[0]}! 👋</h2>
                    <p className="text-purple-100 text-lg leading-relaxed opacity-90">{t('hello_student')}</p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <GraduationCap className="h-64 w-64 transform translate-x-12 translate-y-12 -rotate-12" />
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
                </div>

                {/* Recent Attendance */}
                <div className="lg:col-span-2 m3-card p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#FFD8E4] p-3 rounded-2xl">
                      <Clock className="h-6 w-6 text-[#31111D]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{t('recent_attendance')}</h2>
                      <p className="text-sm text-gray-500">5 Kehadiran Terakhir</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-50 bg-gray-50/30">
                        {attendance.length > 0 ? attendance.slice(0, 5).map(record => (
                          <tr key={record.id} className="hover:bg-white transition-colors">
                            <td className="py-4 px-4 text-sm font-medium text-gray-700">
                              {format(new Date(record.date), 'EEEE, dd MMMM yyyy', { locale: dateLocale })}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5",
                                record.status === 'Present' && "bg-green-100 text-green-700",
                                record.status === 'Sick' && "bg-blue-100 text-blue-700",
                                record.status === 'Permission' && "bg-yellow-100 text-yellow-700",
                                record.status === 'Alpha' && "bg-red-100 text-red-700",
                              )}>
                                <span className={clsx("w-1.5 h-1.5 rounded-full", 
                                  record.status === 'Present' ? "bg-green-500" :
                                  record.status === 'Sick' ? "bg-blue-500" :
                                  record.status === 'Permission' ? "bg-yellow-500" : "bg-red-500"
                                )}></span>
                                {getStatusLabel(record.status)}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={2} className="py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                              <AlertCircle className="h-6 w-6 opacity-30" />
                              Belum ada data absensi.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="m3-card p-6 sm:p-8 flex flex-col justify-center items-center text-center bg-gradient-to-b from-white to-purple-50/50">
                  <div className="w-24 h-24 rounded-full bg-[#EADDFF] flex items-center justify-center mb-6 shadow-inner">
                    <span className="text-4xl font-bold text-[#21005D]">{grades.length}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('total_exams')}</h3>
                  <p className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-100">
                    {t('this_semester')}
                  </p>
                </div>
              </div>
            )}

            {/* Academics Tab */}
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

            {/* Profile Tab */}
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
