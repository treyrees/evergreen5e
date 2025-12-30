'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export interface AnimatedNumberProps {
  /** The numeric value to display */
  value: number;
  /** Number of decimal places (default: 1) */
  decimals?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated number component for smooth score transitions.
 * Uses Framer Motion spring physics for natural feeling animations.
 */
export function AnimatedNumber({
  value,
  decimals = 1,
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (current) => current.toFixed(decimals));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
