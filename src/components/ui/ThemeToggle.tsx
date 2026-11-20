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
        className={`w-9 h-9 rounded-xl border border-gray-200/70 dark:border-[#1E293B] bg-gray-50/80 dark:bg-[#111827] flex items-center justify-center opacity-60 ${className}`}
        aria-hidden="true"
      >
        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
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

    // Direct toggle if reduced motion is requested
    if (prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    // Determine liquid ripple origin point (click position or button center)
    const rect = e.currentTarget?.getBoundingClientRect() || buttonRef.current?.getBoundingClientRect();
    let x = e.clientX;
    let y = e.clientY;

    if (!x || !y || (x === 0 && y === 0)) {
      if (rect) {
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
      }
    }

    // Calculate maximum radius to screen corners
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Primary: Native View Transitions API with SVG Liquid Displacement Filter
    if (doc.startViewTransition) {
      setIsTransitioning(true);
      try {
        const transition = doc.startViewTransition(async () => {
          setTheme(nextTheme);
          // Allow microtask for Next-Themes to commit class change
          await new Promise((resolve) => setTimeout(resolve, 15));
        });

        await transition.ready;

        const animation = document.documentElement.animate(
          [
            {
              clipPath: `circle(0px at ${x}px ${y}px)`,
            },
            {
              clipPath: `circle(${endRadius * 1.3}px at ${x}px ${y}px)`,
            },
          ],
          {
            duration: 800,
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
    } else {
      // Graceful Fallback for browsers without View Transitions (e.g. older Firefox/WebKit):
      // Dynamic organic liquid ink wave overlay
      setIsTransitioning(true);
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '999999';
      overlay.style.backgroundColor = nextTheme === 'dark' ? '#0A0F1D' : '#FAFAF8';
      overlay.style.filter = 'url(#liquid-theme-filter)';
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      overlay.style.transition = 'clip-path 0.75s cubic-bezier(0.22, 1, 0.36, 1)';
      document.body.appendChild(overlay);

      // Force layout repaint then expand
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${endRadius * 1.3}px at ${x}px ${y}px)`;
      });

      setTimeout(() => {
        setTheme(nextTheme);
      }, 350);

      setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          setIsTransitioning(false);
        }, 200);
      }, 750);
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
          ? 'bg-[#111827] border border-[#1E293B] text-amber-300 hover:bg-[#162032] hover:border-slate-600 hover:text-amber-200 shadow-sm'
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
        <span className="text-xs font-medium text-charcoal-700 dark:text-slate-200">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
