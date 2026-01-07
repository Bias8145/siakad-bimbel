import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Students() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('students').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success(t('deleted_success'));
      fetchStudents();
    } catch (error) {
      toast.error(t('error_generic'));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('students')}</h1>
          <p className="mt-2 text-gray-600">{t('manage_students')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setEditingStudent(null); setIsFormOpen(true); }}
            className="m3-button m3-button-primary shadow-xl shadow-blue-600/20"
          >
            <Plus className="h-5 w-5" />
            {t('add_student')}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-2 rounded-2xl flex items-center max-w-md bg-white">
        <div className="p-3 text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Card */}
      <div className="glass-card overflow-hidden border border-white/50 shadow-xl rounded-[32px]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-5 pl-8 pr-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('name_header')}</th>
                <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('grade_header')}</th>
                <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('parent_header')}</th>
                <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('status_header')}</th>
                <th className="relative py-5 pl-4 pr-8">
                  <span className="sr-only">{t('actions_header')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white/60">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">{t('loading')}</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">{t('no_students')}</td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="whitespace-nowrap py-5 pl-8 pr-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-inner border border-white">
                          {student.full_name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-bold text-gray-900 text-base">{student.full_name}</div>
                          <div className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {student.email || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5">
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold border border-gray-200">
                        {student.grade_level}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5">
                      <div className="text-sm font-medium text-gray-900">{student.parent_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {student.parent_phone}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        student.status === 'Active' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {student.status === 'Active' ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-4 pr-8 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingStudent(student); setIsFormOpen(true); }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors border border-transparent hover:border-blue-100"
                          title={t('edit')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(student.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors border border-transparent hover:border-red-100"
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

      {/* Form Modal */}
      {isFormOpen && (
        <StudentModal 
          student={editingStudent} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchStudents(); }} 
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_title')}
        message={t('confirm_delete_desc')}
        type="danger"
      />
    </div>
  );
}

function StudentModal({ student, onClose, onSuccess }: { student: Student | null, onClose: () => void, onSuccess: () => void }) {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<Student>>({
    defaultValues: student || { status: 'Active' }
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: Partial<Student>) => {
    setSaving(true);
    try {
      if (student) {
        const { error } = await supabase.from('students').update(data).eq('id', student.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('students').insert([data]);
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
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
        
        <div className="relative inline-block transform overflow-hidden rounded-[32px] bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-8 pt-8 pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {student ? t('edit_student') : t('add_new_student')}
              </h3>
              
              <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('full_name')}</label>
                  <input 
                    {...register('full_name', { required: true })} 
                    className="m3-input" 
                    placeholder={t('full_name')} 
                  />
                  {errors.full_name && <span className="text-xs text-red-500 mt-1">{t('required_field')}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('email')}</label>
                  <input 
                    type="email" 
                    {...register('email', { required: true })} 
                    className="m3-input" 
                    placeholder={t('email_placeholder')} 
                  />
                  {errors.email && <span className="text-xs text-red-500 mt-1">{t('email_required')}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('dob')}</label>
                  <input 
                    type="date" 
                    {...register('date_of_birth', { required: true })} 
                    className="m3-input" 
                  />
                  {errors.date_of_birth && <span className="text-xs text-red-500 mt-1">{t('required_field')}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('grade_level')}</label>
                  <select {...register('grade_level', { required: true })} className="m3-input">
                    <option value="">{t('select_grade')}</option>
                    <optgroup label={t('preschool')}>
                      <option value="Play Group">Play Group (PG)</option>
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
                  {errors.grade_level && <span className="text-xs text-red-500 mt-1">{t('required_field')}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('status')}</label>
                  <select {...register('status')} className="m3-input">
                    <option value="Active">{t('active')}</option>
                    <option value="Inactive">{t('inactive')}</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-4 border-t border-gray-100 mt-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                    {t('parent_info')}
                  </h4>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('parent_name')}</label>
                  <input {...register('parent_name')} className="m3-input" placeholder={t('parent_name')} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('parent_phone')}</label>
                  <input {...register('parent_phone')} className="m3-input" placeholder="0812..." />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-5 flex flex-row-reverse gap-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="m3-button m3-button-primary px-8 py-2.5 text-sm"
              >
                {saving ? t('saving') : t('save')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="m3-button bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 px-6 py-2.5 text-sm"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
