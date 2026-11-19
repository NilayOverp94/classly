import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  href?: string;
  showText?: boolean;
}

export function Logo({ 
  className = '', 
  size = 'md', 
  variant = 'dark', 
  href = '/',
  showText = true,
}: LogoProps) {
  const pixelSizes = {
    sm: { w: 26, h: 26 },
    md: { w: 32, h: 32 },
    lg: { w: 40, h: 40 },
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const isLight = variant === 'light';
  const { w, h } = pixelSizes[size];

  return (
    <Link 
      href={href} 
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight group select-none ${className}`}
    >
      <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/images/logo-mark.png"
          alt="Classly Logo"
          width={w}
          height={h}
          priority
          className="object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold tracking-tight ${textSizes[size]} ${isLight ? 'text-white' : 'text-navy-800 dark:text-white'}`}>
            Classly<span className="text-[#F59E0B]">.</span>
          </span>
        </div>
      )}
    </Link>
  );
}

