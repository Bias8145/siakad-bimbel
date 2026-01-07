import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grade, Schedule, Attendance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, GraduationCap, Clock, User, Printer, Layout, UserCircle, Upload, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateLocale } from 'date-fns/locale';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

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
        
        // Fetch Schedule (Filtered by Grade Level AND Branch)
        let query = supabase
          .from('schedules')
          .select('*')
          .eq('grade_level', student.grade_level)
          .order('day_of_week');
        
        // If student has a branch, filter schedule by that branch too (optional logic, but good for accuracy)
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
    const fileName = `${student.id}-${Math.random()}.${fileExt}`;
    const filePath = `student-photos/${fileName}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update student record in DB
      const { error: updateError } = await supabase
        .from('students')
        .update({ photo_url: data.publicUrl })
        .eq('id', student.id);

      if (updateError) throw updateError;

      // Update local session
      loginStudent({ ...student, photo_url: data.publicUrl });
      
      toast.success('Foto profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#FEF7FF] p-4 sm:p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 no-print gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-14 w-14 rounded-full bg-[#EADDFF] flex items-center justify-center text-[#21005D] font-bold text-xl overflow-hidden border-2 border-white shadow-md">
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
            ) : (
              student.full_name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1D1B20]">{student.full_name}</h1>
            <p className="text-sm text-gray-500">{student.grade_level} • {student.branch || 'Pusat'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'EN' : 'ID'}
          </button>
          <button 
            onClick={handleLogout}
            className="p-3 rounded-full hover:bg-red-50 text-red-500 transition-colors bg-red-50/50"
            title={t('sign_out')}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 overflow-x-auto pb-2 no-print scrollbar-hide">
        <button
          onClick={() => setActiveTab('overview')}
          className={clsx(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeTab === 'overview' ? "bg-[#4F378B] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <Layout className="h-4 w-4 inline-block mr-2" />
          {t('tab_overview')}
        </button>
        <button
          onClick={() => setActiveTab('academics')}
          className={clsx(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeTab === 'academics' ? "bg-[#4F378B] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <GraduationCap className="h-4 w-4 inline-block mr-2" />
          {t('tab_academics')}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={clsx(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeTab === 'profile' ? "bg-[#4F378B] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <UserCircle className="h-4 w-4 inline-block mr-2" />
          {t('tab_profile')}
        </button>
      </div>

      <main className="max-w-6xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Card */}
            <div className="lg:col-span-3 bg-gradient-to-r from-[#4F378B] to-[#6750A4] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">{t('welcome')} {student.full_name.split(' ')[0]}!</h2>
                <p className="text-blue-100">{t('hello_student')}</p>
              </div>
              <GraduationCap className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white opacity-10 rotate-12" />
            </div>

            {/* Recent Attendance */}
            <div className="lg:col-span-2 m3-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFD8E4] p-2 rounded-xl">
                  <Clock className="h-6 w-6 text-[#31111D]" />
                </div>
                <h2 className="text-xl font-bold">{t('recent_attendance')}</h2>
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
                            {record.status === 'Present' ? t('present') : record.status}
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
              <h3 className="font-bold text-gray-900">{t('total_exams')}</h3>
              <p className="text-sm text-gray-500">{t('this_semester')}</p>
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
                  {t('print_report')}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="py-3 font-bold text-gray-600">{t('subject')}</th>
                      <th className="py-3 font-bold text-gray-600">{t('exam_type')}</th>
                      <th className="py-3 font-bold text-gray-600">{t('date')}</th>
                      <th className="py-3 font-bold text-gray-600 text-right">{t('score')}</th>
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
                {grades.length === 0 && <p className="text-center py-8 text-gray-500">{t('no_grades')}</p>}
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
                <div className="relative w-32 h-32 mx-auto mb-4 group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-[#EADDFF] border-4 border-white shadow-lg flex items-center justify-center">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-[#21005D]">{student.full_name.charAt(0)}</span>
                    )}
                  </div>
                  
                  {/* Upload Button Overlay */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <Upload className="h-8 w-8" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                  
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold">{student.full_name}</h2>
                <p className="text-gray-500">{t('active')} • {student.grade_level}</p>
                <p className="text-sm font-medium text-[#4F378B] mt-1">{student.branch || 'Pusat'}</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('email')}</label>
                    <p className="text-gray-900 font-medium">{student.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dob')}</label>
                    <p className="text-gray-900 font-medium">
                      {student.date_of_birth ? format(new Date(student.date_of_birth), 'dd MMMM yyyy', { locale: dateLocale }) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('parent_name')}</label>
                    <p className="text-gray-900 font-medium">{student.parent_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('parent_phone')}</label>
                    <p className="text-gray-900 font-medium">{student.parent_phone || '-'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                    <UserCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      {t('contact_admin_note')}
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
