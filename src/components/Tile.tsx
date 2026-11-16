import React from 'react';
import { TileItem } from '../game/levels/generateAllLevels';

interface TileProps {
  tile: TileItem;
  isDragging?: boolean;
  isInSlot?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  isDragging = false,
  isInSlot = false,
  isLocked = false,
  onClick,
  onPointerDown,
}) => {
  const isOperator = tile.type === 'operator';

  // Tactile color schemes for wooden/acrylic magnetic blocks
  let colorClasses = '';
  if (isLocked) {
    colorClasses = 'bg-stone-300 text-stone-600 border-b-4 border-stone-400 shadow-inner cursor-not-allowed';
  } else if (isOperator) {
    colorClasses = 'bg-gradient-to-b from-cyan-400 to-teal-500 text-white border-b-4 border-teal-700 shadow-teal-900/20';
  } else {
    // Number tile: Warm honey acrylic / wooden aesthetic
    colorClasses = 'bg-gradient-to-b from-amber-300 via-orange-300 to-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-amber-900/20';
  }

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      onPointerDown={isLocked ? undefined : onPointerDown}
      data-tile-id={tile.id}
      data-tile-value={tile.value}
      data-tile-type={tile.type}
      className={`relative select-none flex items-center justify-center font-bold rounded-2xl transition-all duration-150 touch-none ${
        isInSlot ? 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl' : 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl'
      } ${colorClasses} ${
        isDragging
          ? 'opacity-80 scale-110 shadow-2xl z-50 ring-4 ring-amber-400/80 cursor-grabbing'
          : isLocked
          ? ''
          : 'tile-3d cursor-grab active:cursor-grabbing hover:scale-105'
      }`}
      style={{
        textShadow: isOperator ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 1px rgba(255,255,255,0.7)',
      }}
    >
      {/* Glossy top bevel reflection */}
      <div className="absolute top-1 left-2 right-2 h-2 rounded-t-lg bg-white/35 pointer-events-none" />

      {/* Value */}
      <span className="relative z-10 leading-none">{tile.value}</span>

      {/* Subtle magnetic corner pin cue */}
      {!isLocked && (
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black/15" />
      )}
    </div>
  );
};
