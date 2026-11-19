'use client';

import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  PhoneOff, 
  CheckCircle2, 
  X, 
  Info,
  AlertCircle,
  Loader2
} from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  theme?: 'dark' | 'light';
  icon?: 'exit' | 'delete' | 'warning' | 'info' | 'success';
  details?: React.ReactNode;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  theme = 'light',
  icon = 'warning',
  details,
  isLoading = false,
}: ConfirmModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const renderIcon = () => {
    switch (icon) {
      case 'exit':
        return <PhoneOff className="w-6 h-6 animate-pulse" />;
      case 'delete':
        return <Trash2 className="w-6 h-6" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
    }
  };

  const getIconContainerStyle = () => {
    if (isDark) {
      switch (variant) {
        case 'danger':
          return 'bg-red-500/15 border-red-500/30 text-red-400';
        case 'warning':
          return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
        case 'success':
          return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
        case 'info':
        default:
          return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
      }
    } else {
      switch (variant) {
        case 'danger':
          return 'bg-red-50 border-red-200 text-red-600';
        case 'warning':
          return 'bg-amber-50 border-amber-200 text-amber-600';
        case 'success':
          return 'bg-emerald-50 border-emerald-200 text-emerald-600';
        case 'info':
        default:
          return 'bg-blue-50 border-blue-200 text-blue-600';
      }
    }
  };

  const getConfirmButtonStyle = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-red-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-amber-600/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-600/20';
      case 'info':
      default:
        return 'bg-navy-800 hover:bg-navy-900 text-white shadow-sm';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Blurred Backdrop */}
      <div 
        onClick={() => !isLoading && onClose()}
        className={`fixed inset-0 transition-opacity backdrop-blur-md ${
          isDark ? 'bg-navy-950/80' : 'bg-navy-950/40'
        }`}
      />

      {/* Modal Dialog Card */}
      <div 
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-7 shadow-2xl transition-all transform animate-in zoom-in-95 duration-200 ${
          isDark 
            ? 'bg-navy-900/95 border-navy-700/80 text-white shadow-navy-950/50' 
            : 'bg-white dark:bg-[#111C2E] border-gray-200 dark:border-slate-700 text-navy-800 dark:text-white shadow-xl'
        }`}
      >
        {/* Close 'X' Button */}
        <button
          onClick={() => !isLoading && onClose()}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-navy-800' 
              : 'text-charcoal-400 hover:text-navy-800 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          
          {/* Animated Icon Circle */}
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 transition-transform transform hover:scale-105 shadow-sm ${getIconContainerStyle()}`}>
            {renderIcon()}
          </div>

          {/* Heading */}
          <h3 className={`text-lg font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-navy-900'}`}>
            {title}
          </h3>

          {/* Description */}
          <p className={`text-xs leading-relaxed max-w-sm mb-4 ${isDark ? 'text-gray-300' : 'text-charcoal-600'}`}>
            {description}
          </p>

          {/* Optional Details Box */}
          {details && (
            <div className={`w-full mb-5 rounded-xl border p-3.5 text-xs text-left ${
              isDark 
                ? 'bg-navy-950/60 border-navy-800 text-gray-300' 
                : 'bg-gray-50 border-gray-200 text-charcoal-700'
            }`}>
              {details}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition border ${
                isDark
                  ? 'bg-navy-800/80 hover:bg-navy-800 text-gray-200 border-navy-700'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-charcoal-700 dark:text-slate-200 border-gray-200 dark:border-slate-700'
              }`}
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${getConfirmButtonStyle()}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
