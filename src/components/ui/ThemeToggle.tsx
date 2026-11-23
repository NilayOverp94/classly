'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-9 h-9 rounded-xl border border-gray-200/70 dark:border-[#27272a] bg-gray-50/80 dark:bg-[#121215] flex items-center justify-center opacity-60 ${className}`}
        aria-hidden="true"
      >
        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning) return;
    const nextTheme = isDark ? 'light' : 'dark';

    // Respect reduced motion accessibility
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const doc = document as any;

    // Direct toggle if reduced motion is requested or View Transitions not supported
    if (prefersReducedMotion || !doc.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Determine circular ripple origin point (click position or button center)
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = e.clientX && e.clientX > 0 ? e.clientX : (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = e.clientY && e.clientY > 0 ? e.clientY : (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);

    // Calculate maximum radius to screen corners with safety padding for total coverage
    const endRadius = Math.ceil(
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )
    ) + 12;

    // Native View Transitions API with expanding circular reveal
    setIsTransitioning(true);
    try {
      const transition = doc.startViewTransition(() => {
        // Immediately sync root dark class for instant snapshot capture
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        setTheme(nextTheme);
      });

      await transition.ready;

      const animation = document.documentElement.animate(
        [
          {
            clipPath: `circle(0px at ${x}px ${y}px)`,
          },
          {
            clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
          },
        ],
        {
          duration: 520,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );

      animation.onfinish = () => {
        setIsTransitioning(false);
      };
    } catch (err) {
      setTheme(nextTheme);
      setIsTransitioning(false);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      disabled={isTransitioning}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-95 disabled:pointer-events-none ${
        showLabel 
          ? 'px-3 py-1.5 text-xs font-semibold' 
          : 'w-9 h-9'
      } ${
        isDark
          ? 'bg-[#121215] border border-[#27272a] text-amber-300 hover:bg-[#18181c] hover:border-zinc-700 hover:text-amber-200 shadow-sm'
          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200/90 text-charcoal-700 hover:text-navy-900 shadow-subtle'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center text-amber-300"
            >
              <Sun className="w-4 h-4 stroke-[2.2]" />
            </motion.div>
          ) : (
            <motion.div
              key="light"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center text-slate-700"
            >
              <Moon className="w-4 h-4 stroke-[2.2]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-charcoal-700 dark:text-zinc-200">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
