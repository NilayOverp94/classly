'use client';

import React from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export function ScrollProgressBar() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-accent-400 via-softblue-400 to-amber-400 origin-left z-50 pointer-events-none"
    />
  );
}
