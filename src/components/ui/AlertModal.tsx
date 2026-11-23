'use client';

import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Sparkles 
} from 'lucide-react';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  theme?: 'dark' | 'light' | 'auto';
  buttonText?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  theme = 'auto',
  buttonText = 'Understood',
}: AlertModalProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = theme === 'auto' ? resolvedTheme === 'dark' : theme === 'dark';

  const renderIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-accent-500" />;
    }
  };

  const getIconContainerStyle = () => {
    if (isDark) {
      switch (variant) {
        case 'success':
          return 'bg-emerald-500/15 border-emerald-500/30';
        case 'error':
          return 'bg-red-500/15 border-red-500/30';
        case 'warning':
          return 'bg-amber-500/15 border-amber-500/30';
        case 'info':
        default:
          return 'bg-accent-500/15 border-accent-500/30';
      }
    } else {
      switch (variant) {
        case 'success':
          return 'bg-emerald-50 border-emerald-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-amber-50 border-amber-200';
        case 'info':
        default:
          return 'bg-softblue-50 border-softblue-200';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Blurred Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 transition-opacity backdrop-blur-md ${
          isDark ? 'bg-navy-950/80' : 'bg-navy-950/40'
        }`}
      />

      {/* Modal Card */}
      <div 
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl transition-all transform animate-in zoom-in-95 duration-200 ${
          isDark 
            ? 'bg-navy-900/95 border-navy-700/80 text-white shadow-navy-950/50' 
            : 'bg-white dark:bg-[#121215] border-gray-200 dark:border-[#27272a] text-navy-800 dark:text-white shadow-xl'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-navy-800' 
              : 'text-charcoal-400 hover:text-navy-800 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-[#18181c]'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 ${getIconContainerStyle()}`}>
          {renderIcon()}
        </div>

        <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-navy-900'}`}>
          {title}
        </h3>

        <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-charcoal-600'}`}>
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition bg-navy-800 hover:bg-navy-900 text-white shadow-sm"
        >
          {buttonText}
        </button>
      </div>

    </div>
  );
}
