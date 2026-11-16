import React from 'react';
import { SlotDefinition, TileItem } from '../game/levels/generateAllLevels';
import { Tile } from './Tile';
import { Lock } from 'lucide-react';

interface SlotProps {
  slot: SlotDefinition;
  slottedTile?: TileItem;
  isHoveredOver?: boolean;
  onTileClick?: () => void;
  onPointerDownTile?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const Slot: React.FC<SlotProps> = ({
  slot,
  slottedTile,
  isHoveredOver = false,
  onTileClick,
  onPointerDownTile,
}) => {
  if (slot.isLocked) {
    const lockedTileItem: TileItem = {
      id: slot.id,
      value: slot.value || '',
      type: slot.expectedType === 'operator' ? 'operator' : 'number',
    };

    return (
      <div className="relative flex flex-col items-center">
        <Tile tile={lockedTileItem} isInSlot={true} isLocked={true} />
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-stone-500 text-white flex items-center justify-center shadow-xs">
          <Lock size={11} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot-id={slot.id}
      data-expected-type={slot.expectedType}
      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-150 ${
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
          onClick={onTileClick}
          onPointerDown={onPointerDownTile}
        />
      ) : (
        <span className="text-stone-300 font-bold text-xs uppercase tracking-wider select-none pointer-events-none">
          {slot.expectedType === 'operator' ? 'OP' : 'NUM'}
        </span>
      )}
    </div>
  );
};
