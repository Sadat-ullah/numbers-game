import React from 'react';
import { SlotDefinition, TileItem } from '../game/levels/generateAllLevels';
import { Tile } from './Tile';
import { Lock } from 'lucide-react';

interface SlotProps {
  slot: SlotDefinition;
  slottedTile?: TileItem;
  isHoveredOver?: boolean;
  compact?: boolean;
  onTileClick?: () => void;
  onPointerDownTile?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const Slot: React.FC<SlotProps> = ({
  slot,
  slottedTile,
  isHoveredOver = false,
  compact = false,
  onTileClick,
  onPointerDownTile,
}) => {
  const sizeClasses = compact
    ? 'w-11 h-11 min-w-[44px] min-h-[44px] sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl'
    : 'w-13 h-13 min-w-[52px] min-h-[52px] sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl';

  if (slot.isLocked) {
    const lockedTileItem: TileItem = {
      id: slot.id,
      value: slot.value || '',
      type: slot.expectedType === 'operator' ? 'operator' : 'number',
    };

    return (
      <div className="relative flex flex-col items-center shrink-0">
        <Tile tile={lockedTileItem} isInSlot={true} isLocked={true} compact={compact} />
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-stone-500 text-white flex items-center justify-center shadow-xs">
          <Lock size={10} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot-id={slot.id}
      data-expected-type={slot.expectedType}
      className={`relative select-none flex items-center justify-center transition-all duration-150 shrink-0 ${sizeClasses} ${
        slottedTile
          ? 'bg-transparent'
          : `slot-sunken border-2 border-dashed ${
              isHoveredOver
                ? 'bg-amber-100/80 border-amber-500 scale-105 ring-4 ring-amber-300/60'
                : 'bg-stone-200/60 border-stone-300/80'
            }`
      }`}
    >
      {slottedTile ? (
        <Tile
          tile={slottedTile}
          isInSlot={true}
          compact={compact}
          onClick={onTileClick}
          onPointerDown={onPointerDownTile}
        />
      ) : (
        <span className="text-stone-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider select-none pointer-events-none">
          {slot.expectedType === 'operator' ? 'OP' : 'NUM'}
        </span>
      )}
    </div>
  );
};
