import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export function Logo({ className = '', size = 'md', variant = 'dark' }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const isLight = variant === 'light';

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-bold tracking-tight group select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-lg bg-navy-800 p-1.5 transition-transform group-hover:scale-105 shadow-subtle ${isLight ? 'bg-white' : 'bg-navy-800'}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconSizes[size]}
        >
          {/* Subtle learning/connection motif: interlocking open pages with upward growth node */}
          <path
            d="M5 23C8.5 21 12 21 16 23.5V8.5C12 6.5 8.5 6.5 5 8.5V23Z"
            fill={isLight ? "#183153" : "#FFFFFF"}
            fillOpacity="0.95"
          />
          <path
            d="M27 23C23.5 21 20 21 16 23.5V8.5C20 6.5 23.5 6.5 27 8.5V23Z"
            fill={isLight ? "#45A879" : "#45A879"}
          />
          <circle
            cx="16"
            cy="5.5"
            r="2.5"
            fill={isLight ? "#183153" : "#FFFFFF"}
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-semibold tracking-tight ${textSizes[size]} ${isLight ? 'text-white' : 'text-navy-800'}`}>
          Classly<span className="text-accent-400">.</span>
        </span>
      </div>
    </Link>
  );
}

