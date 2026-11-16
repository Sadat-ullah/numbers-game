import React from 'react';
import { SlotDefinition, TileItem } from '../game/levels/generateAllLevels';
import { Tile } from './Tile';
import { Lock } from 'lucide-react';

interface SlotProps {
  slot: SlotDefinition;
  slottedTile?: TileItem;
  isHoveredOver?: boolean;
  compact?: boolean;
  isHintTarget?: boolean;
  onTileClick?: () => void;
  onPointerDownTile?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDragStartTile?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Slot: React.FC<SlotProps> = ({
  slot,
  slottedTile,
  isHoveredOver = false,
  compact = false,
  isHintTarget = false,
  onTileClick,
  onPointerDownTile,
  onDragStartTile,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const sizeClasses = compact
    ? 'w-13 h-13 min-w-[52px] min-h-[52px] sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-2xl'
    : 'w-16 h-16 min-w-[64px] min-h-[64px] sm:w-22 sm:h-22 md:w-26 md:h-26 rounded-2xl sm:rounded-3xl';

  if (slot.isLocked) {
    const lockedTileItem: TileItem = {
      id: slot.id,
      value: slot.value || '',
      type: slot.expectedType === 'operator' ? 'operator' : 'number',
    };

    return (
      <div className="relative flex flex-col items-center shrink-0">
        <Tile tile={lockedTileItem} isInSlot={true} isLocked={true} compact={compact} />
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-600 text-white flex items-center justify-center shadow-xs">
          <Lock size={11} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot-id={slot.id}
      data-expected-type={slot.expectedType}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative select-none flex items-center justify-center transition-all duration-150 shrink-0 ${sizeClasses} ${
        slottedTile
          ? 'bg-transparent'
          : `slot-sunken border-3 border-dashed ${
              isHintTarget
                ? 'hint-highlight border-amber-500 bg-amber-100/90 ring-4 ring-amber-400'
                : isHoveredOver
                ? 'bg-amber-100/90 border-amber-500 scale-105 ring-4 ring-amber-300/80'
                : 'bg-stone-200/70 border-stone-300/90'
            }`
      }`}
    >
      {slottedTile ? (
        <Tile
          tile={slottedTile}
          fromSlotId={slot.id}
          isInSlot={true}
          compact={compact}
          onClick={onTileClick}
          onPointerDown={onPointerDownTile}
          onDragStart={onDragStartTile}
        />
      ) : (
        <span className="text-stone-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider select-none pointer-events-none">
          {slot.expectedType === 'operator' ? 'OP' : 'NUM'}
        </span>
      )}
    </div>
  );
};
