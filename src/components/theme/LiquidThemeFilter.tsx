'use client';

import React from 'react';

/**
 * Liquid Theme Filter & SVG Distortion Map
 * Provides an organic fluid turbulence and displacement map for the View Transitions API,
 * creating an ink-bleed / liquid-wave transition between dark mode and light mode.
 */
export function LiquidThemeFilter() {
  return (
    <svg
      className="fixed pointer-events-none opacity-0 select-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: -9999,
        visibility: 'hidden',
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Organic Liquid Wave / Ink Splatter Filter */}
        <filter
          id="liquid-theme-filter"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          {/* Fractal Perlin noise creates fluid waves and ink bleeding edges */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.022"
            numOctaves="3"
            seed="42"
            result="liquidNoise"
          />
          {/* Displace the graphic boundaries by the turbulent noise */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="liquidNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="G"
            result="liquidDisplacement"
          />
        </filter>
      </defs>
    </svg>
  );
}
