import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Schedule } from '../types';
import { Plus, Clock, MapPin, User, Edit2, Trash2, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function SchedulePage() {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  
  // Delete Confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('day_of_week')
        .order('start_time');
      
      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = selectedBranch === 'All' 
    ? schedules 
    : schedules.filter(s => s.branch === selectedBranch);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success(t('deleted_success'));
      fetchSchedules();
    } catch (error) {
      toast.error(t('error_generic'));
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const getDayLabel = (day: string) => {
    const map: Record<string, string> = {
      'Monday': t('day_monday'),
      'Tuesday': t('day_tuesday'),
      'Wednesday': t('day_wednesday'),
      'Thursday': t('day_thursday'),
      'Friday': t('day_friday'),
      'Saturday': t('day_saturday'),
      'Sunday': t('day_sunday')
    };
    return map[day] || day;
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('class_schedule')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('schedule_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          {/* Branch Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="All">{t('all_branches')}</option>
              <option value="Pusat">Pusat</option>
              <option value="Cabang Barat">Cabang Barat</option>
              <option value="Cabang Timur">Cabang Timur</option>
              <option value="Cabang Selatan">Cabang Selatan</option>
              <option value="Cabang Utara">Cabang Utara</option>
            </select>
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('add_class')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {days.map(day => {
          const daySchedules = filteredSchedules.filter(s => s.day_of_week === day);
          if (daySchedules.length === 0) return null;

          return (
            <div key={day} className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-blue-900">{getDayLabel(day)}</h3>
                <span className="text-xs font-semibold text-blue-400 bg-white px-2 py-1 rounded-lg border border-blue-100">
                  {daySchedules.length} Kelas
                </span>
              </div>
              <div className="divide-y divide-gray-100/50">
                {daySchedules.map(schedule => (
                  <div key={schedule.id} className="p-4 hover:bg-white/50 transition-colors relative group/item">
                    <div className="flex justify-between items-start mb-2 pr-16">
                      <h4 className="font-bold text-gray-800">{schedule.subject}</h4>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-lg whitespace-nowrap">
                        {schedule.grade_level}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-500" />
                        <span>{schedule.teacher_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>{schedule.room || 'Room TBD'} <span className="text-gray-400">({schedule.branch || 'Pusat'})</span></span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(schedule)}
                        className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 border border-gray-100"
                        title={t('edit')}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(schedule.id)}
                        className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50 border border-gray-100"
                        title={t('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filteredSchedules.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-gray-500 glass-panel rounded-2xl">
            {t('no_schedules')}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ScheduleModal 
          schedule={editingSchedule}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchSchedules(); }} 
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_schedule')}
        message={t('confirm_delete_schedule_desc')}
        type="danger"
      />
    </div>
  );
}

function ScheduleModal({ schedule, onClose, onSuccess }: { schedule: Schedule | null, onClose: () => void, onSuccess: () => void }) {
  const { register, handleSubmit } = useForm<Partial<Schedule>>({
    defaultValues: schedule || {
      day_of_week: 'Monday',
      grade_level: '10 SMA',
      branch: 'Pusat'
    }
  });
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const onSubmit = async (data: Partial<Schedule>) => {
    setSaving(true);
    try {
      if (schedule) {
        const { error } = await supabase.from('schedules').update(data).eq('id', schedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('schedules').insert([data]);
        if (error) throw error;
      }
      toast.success(t('saved_success'));
      onSuccess();
    } catch (error) {
      toast.error(t('error_generic'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card w-full max-w-md p-6 bg-white/90">
          <h3 className="text-xl font-bold mb-6 text-gray-900">
            {schedule ? t('edit') : t('add_class')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label>
              <input {...register('subject', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2" placeholder="e.g. Matematika, Fisika" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('teacher')}</label>
              <input {...register('teacher_name', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2" placeholder="e.g. Budi Santoso" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('day_monday').split(' ')[0]}</label>
                <select {...register('day_of_week', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('grade_header')}</label>
                <select {...register('grade_level', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2">
                  <optgroup label={t('preschool')}>
                    <option value="Play Group">PG</option>
                    <option value="TK A">TK A</option>
                    <option value="TK B">TK B</option>
                  </optgroup>
                  <optgroup label={t('elementary')}>
                    <option value="1 SD">1 SD</option>
                    <option value="2 SD">2 SD</option>
                    <option value="3 SD">3 SD</option>
                    <option value="4 SD">4 SD</option>
                    <option value="5 SD">5 SD</option>
                    <option value="6 SD">6 SD</option>
                  </optgroup>
                  <optgroup label={t('junior_high')}>
                    <option value="7 SMP">7 SMP</option>
                    <option value="8 SMP">8 SMP</option>
                    <option value="9 SMP">9 SMP</option>
                  </optgroup>
                  <optgroup label={t('senior_high')}>
                    <option value="10 SMA">10 SMA</option>
                    <option value="11 SMA">11 SMA</option>
                    <option value="12 SMA">12 SMA</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('branch')}</label>
                <select {...register('branch')} className="block w-full rounded-xl glass-input px-4 py-2">
                  <option value="Pusat">Pusat</option>
                  <option value="Cabang Barat">Cabang Barat</option>
                  <option value="Cabang Timur">Cabang Timur</option>
                  <option value="Cabang Selatan">Cabang Selatan</option>
                  <option value="Cabang Utara">Cabang Utara</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('room')}</label>
                <input {...register('room')} className="block w-full rounded-xl glass-input px-4 py-2" placeholder="e.g. Ruang A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('start_time')}</label>
                <input type="time" {...register('start_time', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('end_time')}</label>
                <input type="time" {...register('end_time', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">{t('cancel')}</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">{t('save')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
