import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Upload, User, MapPin, MessageCircle, Eye, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { openWhatsApp } from '../utils/whatsapp';

export default function Students() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
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
    student.grade_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.branch && student.branch.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
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
            onClick={() => { setSelectedStudent(null); setIsFormOpen(true); }}
            className="m3-btn m3-btn-primary shadow-xl shadow-blue-600/20"
          >
            <Plus className="h-5 w-5" />
            {t('add_student')}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-2 rounded-2xl flex items-center max-w-md bg-white border border-gray-200">
        <div className="p-3 text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 outline-none"
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Card */}
      <div className="glass-card overflow-hidden border border-gray-100 shadow-lg rounded-[32px]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-5 pl-8 pr-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('name_header')}</th>
                <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('grade_header')}</th>
                <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('branch')}</th>
                <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('parent_header')}</th>
                <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('status_header')}</th>
                <th className="relative py-5 pl-4 pr-8">
                  <span className="sr-only">{t('actions_header')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">{t('loading')}</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">{t('no_students')}</td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="whitespace-nowrap py-5 pl-8 pr-4 cursor-pointer" onClick={() => handleViewDetail(student)}>
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-lg">
                              {student.full_name.charAt(0)}
                            </div>
                          )}
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
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {student.branch || '-'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5">
                      <div className="text-sm font-medium text-gray-900">{student.parent_name}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {student.parent_phone ? (
                          <button 
                            onClick={() => openWhatsApp(student.parent_phone, `Halo Bapak/Ibu ${student.parent_name}, wali dari siswa ${student.full_name}.`)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-xs font-bold"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Chat WA
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No Phone</span>
                        )}
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
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetail(student)}
                          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors border border-gray-200"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(student)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors border border-blue-200"
                          title={t('edit')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(student.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors border border-red-200"
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
          student={selectedStudent} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchStudents(); }} 
        />
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setIsDetailOpen(false)} 
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

function StudentDetailModal({ student, onClose }: { student: Student, onClose: () => void }) {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
        
        <div className="relative inline-block transform overflow-hidden rounded-[32px] bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-gray-100">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="px-8 pt-8 pb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg mb-4">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-3xl">
                    {student.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mt-2">
                {student.grade_level} • {student.branch || 'Pusat'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Informasi Pribadi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block">Email</span>
                    <span className="text-sm font-medium text-gray-900">{student.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Tanggal Lahir</span>
                    <span className="text-sm font-medium text-gray-900">{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Orang Tua / Wali</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block">Nama Orang Tua</span>
                    <span className="text-sm font-medium text-gray-900">{student.parent_name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-400 block">Nomor Telepon</span>
                      <span className="text-sm font-medium text-gray-900">{student.parent_phone || '-'}</span>
                    </div>
                    {student.parent_phone && (
                      <button 
                        onClick={() => openWhatsApp(student.parent_phone, `Halo Bapak/Ibu ${student.parent_name}.`)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentModal({ student, onClose, onSuccess }: { student: Student | null, onClose: () => void, onSuccess: () => void }) {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Partial<Student>>({
    defaultValues: student || { status: 'Active', branch: 'Pusat' }
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(student?.photo_url || null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `admin_upload_${timestamp}.${fileExt}`;
    const filePath = `student-photos/${fileName}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setValue('photo_url', data.publicUrl);
      setPhotoPreview(data.publicUrl);
      toast.success('Foto berhasil diunggah');
    } catch (error: any) {
      toast.error(`Gagal upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

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
            <div className="px-8 pt-8 pb-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {student ? t('edit_student') : t('add_new_student')}
              </h3>

              {/* Photo Upload Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-24 h-24 mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-gray-400" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <Upload className="h-6 w-6" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  className="text-sm text-blue-600 font-medium hover:underline"
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                >
                  {t('change_photo')}
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('full_name')}</label>
                  <input {...register('full_name', { required: true })} className="m3-input" placeholder={t('full_name')} />
                  {errors.full_name && <span className="text-xs text-red-500 mt-1">{t('required_field')}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('email')}</label>
                  <input type="email" {...register('email', { required: true })} className="m3-input" placeholder={t('email_placeholder')} />
                  {errors.email && <span className="text-xs text-red-500 mt-1">{t('email_required')}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('dob')}</label>
                  <input type="date" {...register('date_of_birth', { required: true })} className="m3-input" />
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
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('branch')}</label>
                  <select {...register('branch')} className="m3-input">
                    <option value="Pusat">Pusat</option>
                    <option value="Cabang Barat">Cabang Barat</option>
                    <option value="Cabang Timur">Cabang Timur</option>
                    <option value="Cabang Selatan">Cabang Selatan</option>
                    <option value="Cabang Utara">Cabang Utara</option>
                  </select>
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
              <button type="submit" disabled={saving || uploading} className="m3-btn m3-btn-primary px-8 py-2.5 text-sm">
                {saving ? t('saving') : t('save')}
              </button>
              <button type="button" onClick={onClose} className="m3-btn bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 px-6 py-2.5 text-sm">
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
