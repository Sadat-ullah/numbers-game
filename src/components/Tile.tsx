import React from 'react';
import { TileItem } from '../game/levels/generateAllLevels';

interface TileProps {
  tile: TileItem;
  isDragging?: boolean;
  isInSlot?: boolean;
  isLocked?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  isDragging = false,
  isLocked = false,
  compact = false,
  onClick,
  onPointerDown,
}) => {
  const isOperator = tile.type === 'operator';

  // Tactile color schemes for wooden/acrylic magnetic blocks
  let colorClasses = '';
  if (isLocked) {
    colorClasses = 'bg-stone-300 text-stone-600 border-b-2 sm:border-b-4 border-stone-400 shadow-inner cursor-not-allowed';
  } else if (isOperator) {
    colorClasses = 'bg-gradient-to-b from-cyan-400 to-teal-500 text-white border-b-2 sm:border-b-4 border-teal-700 shadow-teal-900/20';
  } else {
    // Number tile: Warm honey acrylic / wooden aesthetic
    colorClasses = 'bg-gradient-to-b from-amber-300 via-orange-300 to-amber-400 text-amber-950 border-b-2 sm:border-b-4 border-amber-600 shadow-amber-900/20';
  }

  // Adaptive sizing for mobile vs tablet/desktop
  const sizeClasses = compact
    ? 'w-11 h-11 min-w-[44px] min-h-[44px] sm:w-16 sm:h-16 md:w-20 md:h-20 text-lg sm:text-2xl md:text-3xl rounded-xl sm:rounded-2xl'
    : 'w-13 h-13 min-w-[52px] min-h-[52px] sm:w-18 sm:h-18 md:w-20 md:h-20 text-xl sm:text-2xl md:text-3xl rounded-xl sm:rounded-2xl';

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      onPointerDown={isLocked ? undefined : onPointerDown}
      data-tile-id={tile.id}
      data-tile-value={tile.value}
      data-tile-type={tile.type}
      className={`relative select-none flex items-center justify-center font-bold transition-all duration-150 touch-none shrink-0 ${sizeClasses} ${colorClasses} ${
        isDragging
          ? 'opacity-85 scale-110 shadow-2xl z-50 ring-4 ring-amber-400/80 cursor-grabbing'
          : isLocked
          ? ''
          : 'tile-3d cursor-pointer active:cursor-grabbing hover:scale-105 active:scale-95'
      }`}
      style={{
        textShadow: isOperator ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 1px rgba(255,255,255,0.7)',
      }}
    >
      {/* Glossy top bevel reflection */}
      <div className="absolute top-0.5 sm:top-1 left-1.5 sm:left-2 right-1.5 sm:right-2 h-1.5 sm:h-2 rounded-t-lg bg-white/35 pointer-events-none" />

      {/* Value */}
      <span className="relative z-10 leading-none">{tile.value}</span>

      {/* Subtle magnetic corner pin cue */}
      {!isLocked && (
        <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black/15" />
      )}
    </div>
  );
};
