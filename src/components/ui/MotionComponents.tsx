'use client';

import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

export interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string };
  as?: React.ElementType;
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 18,
  className = '',
  viewport = { once: true, margin: '-40px' },
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  const getOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={{
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1], // Gentle, natural cubic bezier
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string };
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  className = '',
  viewport = { once: true, margin: '-40px' },
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'none';
  distance?: number;
  duration?: number;
  className?: string;
}

export function StaggerItem({
  children,
  direction = 'up',
  distance = 16,
  duration = 0.5,
  className = '',
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  const getY = () => {
    if (shouldReduceMotion) return 0;
    if (direction === 'up') return distance;
    if (direction === 'down') return -distance;
    return 0;
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: getY(),
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scaleStart?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string };
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  scaleStart = 0.95,
  className = '',
  viewport = { once: true, margin: '-40px' },
}: ScaleInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: scaleStart }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewport}
      transition={{
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface FloatProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
  delay?: number;
}

export function Float({
  children,
  amplitude = 6,
  duration = 4,
  delay = 0,
  className = '',
}: FloatProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
