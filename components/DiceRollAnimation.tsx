'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// D&D Polyhedral Dice SVG Components
// These are stylized 2D representations of the classic polyhedral dice shapes

const D4Die = ({ color = '#a78bfa' }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    {/* Tetrahedron - triangular shape */}
    <polygon
      points="20,4 36,34 4,34"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    {/* Inner lines showing 3D structure */}
    <line x1="20" y1="4" x2="20" y2="26" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <line x1="20" y1="26" x2="36" y2="34" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <line x1="20" y1="26" x2="4" y2="34" stroke={color} strokeWidth="1.5" opacity="0.6" />
    {/* Number */}
    <text x="20" y="32" textAnchor="middle" fill={color} fontSize="10" fontFamily="serif" fontWeight="bold">4</text>
  </svg>
);

const D6Die = ({ color = '#60a5fa' }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    {/* Cube face - slightly rotated to show it's 3D, not casino style */}
    <rect x="6" y="8" width="24" height="24" fill="none" stroke={color} strokeWidth="2" rx="3" />
    {/* 3D edge lines */}
    <line x1="30" y1="8" x2="34" y2="4" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <line x1="34" y1="4" x2="34" y2="28" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <line x1="34" y1="28" x2="30" y2="32" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <line x1="6" y1="8" x2="10" y2="4" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <line x1="10" y1="4" x2="34" y2="4" stroke={color} strokeWidth="1.5" opacity="0.6" />
    {/* Number instead of pips - this is the key D&D difference */}
    <text x="18" y="25" textAnchor="middle" fill={color} fontSize="14" fontFamily="serif" fontWeight="bold">6</text>
  </svg>
);

const D8Die = ({ color = '#34d399' }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    {/* Octahedron - diamond/kite shape */}
    <polygon
      points="20,2 36,20 20,38 4,20"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    {/* Center horizontal line showing 3D structure */}
    <line x1="4" y1="20" x2="36" y2="20" stroke={color} strokeWidth="1.5" opacity="0.5" />
    {/* Vertical center accent */}
    <line x1="20" y1="2" x2="20" y2="38" stroke={color} strokeWidth="1" opacity="0.3" />
    {/* Number */}
    <text x="20" y="24" textAnchor="middle" fill={color} fontSize="12" fontFamily="serif" fontWeight="bold">8</text>
  </svg>
);

const D10Die = ({ color = '#f472b6' }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    {/* D10 - kite/pentagonal shape */}
    <polygon
      points="20,2 34,14 32,32 8,32 6,14"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    {/* Internal structure lines */}
    <line x1="20" y1="2" x2="20" y2="24" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <line x1="6" y1="14" x2="34" y2="14" stroke={color} strokeWidth="1" opacity="0.4" />
    {/* Number */}
    <text x="20" y="28" textAnchor="middle" fill={color} fontSize="10" fontFamily="serif" fontWeight="bold">10</text>
  </svg>
);

const D12Die = ({ color = '#fbbf24' }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    {/* Dodecahedron - pentagon shape */}
    <polygon
      points="20,3 35,12 32,30 8,30 5,12"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    {/* Inner pentagon suggesting 3D structure */}
    <polygon
      points="20,10 28,16 26,26 14,26 12,16"
      fill="none"
      stroke={color}
      strokeWidth="1"
      opacity="0.5"
    />
    {/* Number */}
    <text x="20" y="22" textAnchor="middle" fill={color} fontSize="9" fontFamily="serif" fontWeight="bold">12</text>
  </svg>
);

const D20Die = ({ color = '#f87171' }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    {/* Icosahedron - the iconic D20 triangular shape */}
    <polygon
      points="20,2 37,14 34,34 6,34 3,14"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    {/* Internal triangular structure - key D20 look */}
    <line x1="20" y1="2" x2="6" y2="34" stroke={color} strokeWidth="1" opacity="0.4" />
    <line x1="20" y1="2" x2="34" y2="34" stroke={color} strokeWidth="1" opacity="0.4" />
    <line x1="3" y1="14" x2="34" y2="34" stroke={color} strokeWidth="1" opacity="0.4" />
    <line x1="37" y1="14" x2="6" y2="34" stroke={color} strokeWidth="1" opacity="0.4" />
    {/* The number 20 - iconic */}
    <text x="20" y="24" textAnchor="middle" fill={color} fontSize="10" fontFamily="serif" fontWeight="bold">20</text>
  </svg>
);

// Sparkle particle component
const Sparkle = ({ delay, x, y, color }: { delay: number; x: number; y: number; color: string }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ scale: 0, opacity: 0, rotate: 0 }}
    animate={{
      scale: [0, 1.2, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180],
    }}
    transition={{
      duration: 0.6,
      delay,
      ease: 'easeOut',
    }}
  >
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z"
        fill={color}
      />
    </svg>
  </motion.div>
);

// Random values for die animation - generated once per die instance
interface DieRandomValues {
  initialRotate: number;
  xMid: number;
  xEnd: number;
  rotateMid: number;
  rotateEnd: number;
}

// Single die component with tumbling animation
const TumblingDie = ({
  DieComponent,
  delay,
  startX,
  color,
  randomValues,
}: {
  DieComponent: React.ComponentType<{ color?: string }>;
  delay: number;
  startX: number;
  color: string;
  randomValues: DieRandomValues;
}) => (
  <motion.div
    className="absolute w-8 h-8"
    style={{ left: `${startX}%` }}
    initial={{
      y: -20,
      x: 0,
      rotate: randomValues.initialRotate,
      opacity: 0,
      scale: 0.5,
    }}
    animate={{
      y: [null, 30, 60, 40, 60],
      x: [null, randomValues.xMid, randomValues.xEnd],
      rotate: [null, randomValues.rotateMid, randomValues.rotateEnd],
      opacity: [0, 1, 1, 1, 0],
      scale: [0.5, 1, 1, 0.9, 0.6],
    }}
    transition={{
      duration: 1.2,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
      times: [0, 0.3, 0.6, 0.8, 1],
    }}
  >
    <DieComponent color={color} />
  </motion.div>
);

// Dice configurations for the animation
const DICE_SET = [
  { Component: D20Die, color: '#f87171' },  // Red d20
  { Component: D12Die, color: '#fbbf24' },  // Amber d12
  { Component: D8Die, color: '#34d399' },   // Emerald d8
  { Component: D6Die, color: '#60a5fa' },   // Blue d6
  { Component: D4Die, color: '#a78bfa' },   // Violet d4
  { Component: D10Die, color: '#f472b6' },  // Pink d10
];

// Sparkle colors
const SPARKLE_COLORS = ['#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#f87171', '#f472b6'];

// Generate random values for dice and sparkles
function generateRandomDiceValues(): DieRandomValues[] {
  return DICE_SET.map(() => ({
    initialRotate: Math.random() * 360,
    xMid: (Math.random() - 0.5) * 40,
    xEnd: (Math.random() - 0.5) * 60,
    rotateMid: 360 + Math.random() * 720,
    rotateEnd: 720 + Math.random() * 360,
  }));
}

function generateRandomSparkles(): Array<{ id: number; x: number; y: number; delay: number; color: string }> {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    delay: 0.1 + Math.random() * 0.8,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
  }));
}

interface DiceRollAnimationProps {
  isPlaying: boolean;
  onComplete?: () => void;
}

export function DiceRollAnimation({ isPlaying, onComplete }: DiceRollAnimationProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [diceRandomValues, setDiceRandomValues] = useState<DieRandomValues[]>([]);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string }>>([]);

  // Generate new random values when animation starts
  useEffect(() => {
    if (isPlaying) {
      /* eslint-disable react-hooks/set-state-in-effect -- Intentional: initialize animation state when triggered */
      setDiceRandomValues(generateRandomDiceValues());
      setSparkles(generateRandomSparkles());
      setAnimationKey(k => k + 1);
      /* eslint-enable react-hooks/set-state-in-effect */

      // Call onComplete after animation finishes
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, onComplete]);

  // Don't render if we don't have random values yet
  const hasRandomValues = diceRandomValues.length === DICE_SET.length;

  return (
    <AnimatePresence>
      {isPlaying && hasRandomValues && (
        <motion.div
          key={animationKey}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dice tumbling from top */}
          <div className="absolute inset-0 flex items-start justify-center pt-20">
            <div className="relative w-64 h-32">
              {DICE_SET.map((die, index) => (
                <TumblingDie
                  key={index}
                  DieComponent={die.Component}
                  delay={index * 0.08}
                  startX={10 + index * 14}
                  color={die.color}
                  randomValues={diceRandomValues[index]}
                />
              ))}
            </div>
          </div>

          {/* Sparkle particles scattered around */}
          <div className="absolute inset-0">
            {sparkles.map((sparkle) => (
              <Sparkle
                key={sparkle.id}
                x={sparkle.x}
                y={sparkle.y}
                delay={sparkle.delay}
                color={sparkle.color}
              />
            ))}
          </div>

          {/* Brief flash overlay */}
          <motion.div
            className="absolute inset-0 bg-violet-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.4, times: [0, 0.2, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easier integration
export function useDiceRollAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);

  const triggerRoll = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleComplete = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    triggerRoll,
    handleComplete,
  };
}
