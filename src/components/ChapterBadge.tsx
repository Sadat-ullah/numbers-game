import React from 'react';

interface ChapterBadgeProps {
  world: number;
  size?: number;
  unlocked?: boolean;
}

export const ChapterBadge: React.FC<ChapterBadgeProps> = ({ world, size = 48, unlocked = true }) => {
  const worldIcons: Record<number, string> = {
    1: '🔺', // Starter
    2: '➕', // Addition
    3: '➖', // Subtraction
    4: '📐', // Trio
    5: '✖️', // Multiplication
    6: '⚖️', // BODMAS
    7: '➗', // Division
    8: '🏛️', // Academy
    9: '📜', // Blueprint
    10: '💎', // Infinity Vault
  };

  const colors = [
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-blue-500',
    'from-pink-400 to-rose-500',
    'from-purple-400 to-indigo-500',
    'from-yellow-400 to-amber-500',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-600',
    'from-indigo-400 to-violet-600',
    'from-fuchsia-400 to-pink-600',
    'from-rose-400 to-red-600',
  ];

  const colorClass = colors[(world - 1) % colors.length];

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl flex items-center justify-center shadow-md border-2 border-white/60 transition-transform ${
        unlocked
          ? `bg-gradient-to-br ${colorClass} text-white shadow-amber-900/10`
          : 'bg-stone-300 text-stone-400 border-stone-400/40 grayscale'
      }`}
    >
      <span className="text-xl" style={{ fontSize: size * 0.45 }}>
        {unlocked ? worldIcons[world] || '⭐' : '🔒'}
      </span>
      <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-stone-900/80 text-[9px] font-bold text-white tracking-wider">
        W{world}
      </div>
    </div>
  );
};
