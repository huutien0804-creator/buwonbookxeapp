import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmText,
  cancelText,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const resolvedConfirmText = confirmText || (isDestructive ? (lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete') : t.confirm);
  const resolvedCancelText = cancelText || t.cancel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDestructive
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500">
                {lang === 'vi' ? 'Xác nhận thao tác dữ liệu' : 'Confirm data action'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

          {details && details.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-700">
              <span className="font-bold text-slate-800 block mb-1">
                {lang === 'vi' ? 'Chi tiết ảnh hưởng:' : 'Affected items:'}
              </span>
              {details.map((detail, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1.5 disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {isLoading && <span className="animate-spin mr-1">⌛</span>}
            <span>{resolvedConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
