import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div className="relative inline-block transform overflow-hidden rounded-[32px] bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle border border-white/50">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <AlertTriangle className={`h-6 w-6 ${
                  type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-bold leading-6 text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
            <button
              type="button"
              disabled={isLoading}
              className={`inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-all ${
                type === 'danger' 
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' 
                  : 'bg-yellow-600 hover:bg-yellow-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={onConfirm}
            >
              {isLoading ? t('loading') : t('confirm')}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
