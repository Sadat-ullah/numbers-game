import React from 'react';
import { TileItem } from '../game/levels/generateAllLevels';

interface TileProps {
  tile: TileItem;
  fromSlotId?: string;
  isDragging?: boolean;
  isInSlot?: boolean;
  isLocked?: boolean;
  compact?: boolean;
  isHintTarget?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  fromSlotId,
  isDragging = false,
  isInSlot = false,
  isLocked = false,
  compact = false,
  isHintTarget = false,
  onClick,
  onPointerDown,
  onDragStart,
  onDragEnd,
}) => {
  const isOperator = tile.type === 'operator';

  // Tactile color schemes for wooden/acrylic magnetic blocks
  let colorClasses = '';
  if (isLocked) {
    colorClasses = 'bg-stone-300 text-stone-600 border-b-3 sm:border-b-4 border-stone-400 shadow-inner cursor-not-allowed';
  } else if (isOperator) {
    colorClasses = 'bg-gradient-to-b from-cyan-400 to-teal-500 text-white border-b-3 sm:border-b-4 border-teal-700 shadow-teal-900/20';
  } else {
    // Number tile: Warm honey acrylic / wooden aesthetic
    colorClasses = 'bg-gradient-to-b from-amber-300 via-orange-300 to-amber-400 text-amber-950 border-b-3 sm:border-b-4 border-amber-600 shadow-amber-900/20';
  }

  // Enlarged scaling (Fix 9)
  const sizeClasses = compact
    ? 'w-13 h-13 min-w-[52px] min-h-[52px] sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-2xl'
    : 'w-16 h-16 min-w-[64px] min-h-[64px] sm:w-22 sm:h-22 md:w-26 md:h-26 rounded-2xl sm:rounded-3xl';

  return (
    <div
      draggable={!isLocked}
      onClick={isLocked ? undefined : onClick}
      onPointerDown={isLocked ? undefined : onPointerDown}
      onDragStart={isLocked ? undefined : (e) => {
        try {
          e.dataTransfer.setData('application/json', JSON.stringify({ tile, fromSlotId }));
          e.dataTransfer.setData('text/plain', tile.id);
          e.dataTransfer.effectAllowed = 'move';
        } catch {}
        onDragStart?.(e);
      }}
      onDragEnd={isLocked ? undefined : (e) => {
        onDragEnd?.(e);
      }}
      data-tile-id={tile.id}
      data-tile-value={tile.value}
      data-tile-type={tile.type}
      data-in-slot={isInSlot ? "true" : "false"}
      className={`relative select-none flex items-center justify-center font-extrabold transition-all duration-150 touch-none shrink-0 ${sizeClasses} ${colorClasses} ${
        isHintTarget ? 'hint-highlight ring-4 ring-amber-400' : ''
      } ${
        isDragging
          ? 'opacity-85 scale-110 shadow-2xl z-50 ring-4 ring-amber-400/90 cursor-grabbing'
          : isLocked
          ? ''
          : 'tile-3d cursor-grab active:cursor-grabbing hover:scale-105'
      }`}
      style={{
        textShadow: isOperator ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 1px rgba(255,255,255,0.7)',
      }}
    >
      {/* Glossy top bevel reflection */}
      <div className="absolute top-1 left-2 right-2 h-2 rounded-t-xl bg-white/40 pointer-events-none" />

      {/* Bold high-contrast numeral */}
      <span
        className="relative z-10 leading-none"
        style={{ fontSize: 'clamp(1.5rem, 4.2vw, 2.75rem)' }}
      >
        {tile.value}
      </span>

      {/* Subtle magnetic corner pin cue */}
      {!isLocked && (
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-black/20" />
      )}
    </div>
  );
};
