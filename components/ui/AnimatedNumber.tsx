'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
}

/** Animated number component for smooth score transitions */
export function AnimatedNumber({ value, decimals = 1 }: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (current) => current.toFixed(decimals));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
