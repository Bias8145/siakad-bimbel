import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Grade, Student } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Grades() {
  const { t } = useLanguage();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  // Delete Confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*, student:students(full_name, grade_level)')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Cast the data safely
      setGrades((data as unknown as Grade[]) || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('grades').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success(t('deleted_success'));
      fetchGrades();
    } catch (error) {
      toast.error(t('error_generic'));
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingGrade(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('student_grades')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('grades_subtitle')}</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('record_grade')}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('name_header')}</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('subject')}</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('exam_type')}</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('score')}</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('date')}</th>
                <th className="relative py-4 pl-3 pr-6">
                  <span className="sr-only">{t('actions_header')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 bg-white/30">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">{t('loading')}</td></tr>
              ) : grades.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('no_grades')}</td></tr>
              ) : (
                grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-white/40 transition-colors group">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                      {grade.student?.full_name || 'Unknown Student'}
                      <div className="text-gray-500 text-xs">{grade.student?.grade_level || '-'}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{grade.subject}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {grade.exam_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">{grade.score}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{grade.date}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(grade)}
                          className="p-2 hover:bg-[#EADDFF] rounded-full text-[#4F378B] transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(grade.id)}
                          className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <GradeModal 
          grade={editingGrade}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchGrades(); }} 
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_grade')}
        message={t('confirm_delete_grade_desc')}
        type="danger"
      />
    </div>
  );
}

function GradeModal({ grade, onClose, onSuccess }: { grade: Grade | null, onClose: () => void, onSuccess: () => void }) {
  const { register, handleSubmit } = useForm<Partial<Grade>>({
    defaultValues: grade || {
      date: new Date().toISOString().split('T')[0],
      exam_type: 'Tryout'
    }
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.from('students').select('id, full_name').then(({ data }) => setStudents(data || []));
  }, []);

  const onSubmit = async (data: Partial<Grade>) => {
    setSaving(true);
    try {
      if (grade) {
        const { error } = await supabase.from('grades').update(data).eq('id', grade.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('grades').insert([data]);
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
            {grade ? t('edit') : t('record_grade')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('select_student')}</label>
              <select {...register('student_id', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2">
                <option value="">{t('select_student')}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label>
              <input {...register('subject', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2" placeholder="e.g. Matematika" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('exam_type')}</label>
                <select {...register('exam_type', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2">
                  <option value="Tryout">{t('type_tryout')}</option>
                  <option value="Exam">{t('type_exam')}</option>
                  <option value="Quiz">{t('type_quiz')}</option>
                  <option value="Tugas">{t('type_assignment')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('score')}</label>
                <input type="number" step="0.01" {...register('score', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input type="date" {...register('date', { required: true })} className="block w-full rounded-xl glass-input px-4 py-2" />
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
