import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { format } from 'date-fns';
import { Check, X, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'Active')
        .order('full_name');
      
      setStudents(studentsData || []);

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate);

      const map: Record<string, string> = {};
      attendanceData?.forEach(record => {
        map[record.student_id] = record.status;
      });
      setAttendanceMap(map);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: string) => {
    try {
      setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', selectedDate)
        .single();

      if (existing) {
        await supabase.from('attendance').update({ status }).eq('id', existing.id);
      } else {
        await supabase.from('attendance').insert([{ student_id: studentId, date: selectedDate, status }]);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      fetchData();
    }
  };

  const clearAttendance = async (studentId: string) => {
    // No confirmation needed for this simple undo action, but we'll toast
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('student_id', studentId)
        .eq('date', selectedDate);
      
      if (error) throw error;
      
      setAttendanceMap(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
      toast.success(t('deleted_success'));
    } catch (error) {
      toast.error(t('error_generic'));
    }
  };

  const StatusButton = ({ status, icon: Icon, color, activeColor, label, currentStatus, onClick }: any) => (
    <button
      onClick={onClick}
      className={clsx(
        "p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-xs font-medium border",
        currentStatus === status 
          ? `${activeColor} border-transparent text-white shadow-md transform scale-105` 
          : "bg-white/50 border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300"
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('attendance')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('track_attendance')}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full rounded-xl glass-input px-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('name_header')}</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('grade_header')}</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('status_header')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 bg-white/30">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8">{t('loading')}</td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/40 transition-colors group">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                      {student.full_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {student.grade_level}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <StatusButton 
                          status="Present" 
                          icon={Check} 
                          activeColor="bg-green-500" 
                          label={t('present')}
                          currentStatus={attendanceMap[student.id]}
                          onClick={() => markAttendance(student.id, 'Present')}
                        />
                        <StatusButton 
                          status="Permission" 
                          icon={Clock} 
                          activeColor="bg-yellow-500" 
                          label={t('permission')}
                          currentStatus={attendanceMap[student.id]}
                          onClick={() => markAttendance(student.id, 'Permission')}
                        />
                        <StatusButton 
                          status="Sick" 
                          icon={AlertCircle} 
                          activeColor="bg-blue-500" 
                          label={t('sick')}
                          currentStatus={attendanceMap[student.id]}
                          onClick={() => markAttendance(student.id, 'Sick')}
                        />
                        <StatusButton 
                          status="Alpha" 
                          icon={X} 
                          activeColor="bg-red-500" 
                          label={t('alpha')}
                          currentStatus={attendanceMap[student.id]}
                          onClick={() => markAttendance(student.id, 'Alpha')}
                        />
                        
                        {/* Clear Button - Only shows if status exists */}
                        {attendanceMap[student.id] && (
                          <button
                            onClick={() => clearAttendance(student.id)}
                            className="p-2 ml-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title={t('reset')}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
