import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LevelData, TileItem } from '../game/levels/generateAllLevels';
import { MathEvaluator } from '../game/math/evaluator';
import { sound } from '../game/audio/soundEngine';
import { Slot } from './Slot';
import { Tile } from './Tile';
import { Lightbulb, RotateCcw, Check, Sparkles } from 'lucide-react';
import { solveLevel } from '../game/levels/solver';

interface EquationBoardProps {
  level: LevelData;
  onLevelCompleted: (stars: number) => void;
  onOpenLevelGrid: () => void;
}

interface DragState {
  tile: TileItem;
  fromSlotId?: string; // If dragged from a slot
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
}

export const EquationBoard: React.FC<EquationBoardProps> = ({
  level,
  onLevelCompleted,
}) => {
  // Map of slotId -> TileItem
  const [slotPlacements, setSlotPlacements] = useState<Record<string, TileItem>>({});
  // Tiles currently in the bottom tray
  const [trayTiles, setTrayTiles] = useState<TileItem[]>(level.trayTiles);
  
  // Dragging state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  // Visual feedback states
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccessGlow, setIsSuccessGlow] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintHighlightedTileId, setHintHighlightedTileId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const slotsContainerRef = useRef<HTMLDivElement>(null);

  const isCompact = level.slots.length >= 5;

  // Reset state when level changes
  useEffect(() => {
    setSlotPlacements({});
    setTrayTiles([...level.trayTiles]);
    setDragState(null);
    setHoveredSlotId(null);
    setIsShaking(false);
    setIsSuccessGlow(false);
    setHintMessage(null);
    setHintHighlightedTileId(null);
    setHintsUsed(0);
  }, [level]);

  // Find first available slot for a tile type
  const findFirstOpenSlot = useCallback((tile: TileItem): string | null => {
    for (const slot of level.slots) {
      if (slot.isLocked) continue;
      if (slotPlacements[slot.id]) continue; // Already occupied
      if (slot.expectedType === 'any' || slot.expectedType === tile.type) {
        return slot.id;
      }
    }
    return null;
  }, [level.slots, slotPlacements]);

  // Handle single tap on tray tile (tap-to-slot)
  const handleTrayTileClick = useCallback((tile: TileItem) => {
    sound.playTilePickup();
    const openSlotId = findFirstOpenSlot(tile);
    if (!openSlotId) {
      // Gentle nudge: no matching open slot
      sound.playInvalidShake();
      return;
    }

    sound.playTileSnap();
    setSlotPlacements(prev => ({ ...prev, [openSlotId]: tile }));
    setTrayTiles(prev => prev.filter(t => t.id !== tile.id));
    setHintHighlightedTileId(null);
  }, [findFirstOpenSlot]);

  // Handle tap on slotted tile (return to tray)
  const handleSlottedTileClick = useCallback((slotId: string) => {
    const tile = slotPlacements[slotId];
    if (!tile) return;

    sound.playTilePickup();
    setSlotPlacements(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setTrayTiles(prev => [...prev, tile]);
  }, [slotPlacements]);

  // Reset / Clear all movable tiles back to tray
  const handleClearBoard = () => {
    sound.playTilePickup();
    setSlotPlacements({});
    setTrayTiles([...level.trayTiles]);
  };

  // Check answer validation
  const handleCheckAnswer = () => {
    // Collect all tokens in order
    const tokens: string[] = [];
    let isComplete = true;

    for (const slot of level.slots) {
      if (slot.isLocked) {
        tokens.push(slot.value || '');
      } else {
        const placed = slotPlacements[slot.id];
        if (!placed) {
          isComplete = false;
          break;
        }
        tokens.push(placed.value);
      }
    }

    if (!isComplete) {
      sound.playInvalidShake();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const isValid = MathEvaluator.validateEquation(tokens, level.target);

    if (isValid) {
      sound.playLevelSuccess();
      setIsSuccessGlow(true);
      const earnedStars = hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1;
      setTimeout(() => {
        onLevelCompleted(earnedStars);
      }, 700);
    } else {
      sound.playInvalidShake();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Hint Lightbulb: Suggests a tile or places one valid tile
  const handleUseHint = () => {
    sound.playTilePickup();
    setHintsUsed(prev => prev + 1);

    const solutions = solveLevel(level);
    if (solutions.length > 0) {
      const sol = solutions[0];
      // Find the first unfilled slot in the solution
      const unfilled = sol.slotAssignments.find(a => !slotPlacements[a.slotId]);
      if (unfilled) {
        // Highlight matching tile in tray
        const matchingTrayTile = trayTiles.find(t => t.value === unfilled.tileValue);
        if (matchingTrayTile) {
          setHintHighlightedTileId(matchingTrayTile.id);
          setHintMessage(`Try placing "${matchingTrayTile.value}" into the blank slot!`);
          return;
        }
      }
    }
    setHintMessage(level.hintText);
  };

  // -------------------------------------------------------------
  // Pointer Drag-and-Drop & Mobile Touch Unification
  // -------------------------------------------------------------
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    tile: TileItem,
    fromSlotId?: string
  ) => {
    if (e.button !== 0) return;
    
    setDragState({
      tile,
      fromSlotId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX - 28,
      currentY: e.clientY - 28,
      hasMoved: false,
    });
  };

  // Global pointer move listener during drag
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragState) return;

    const distMoved = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
    const hasMoved = distMoved > 8 || dragState.hasMoved;

    setDragState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: e.clientX - 28,
        currentY: e.clientY - 28,
        hasMoved,
      };
    });

    // Detect closest slot under pointer only if actually dragging
    if (hasMoved && slotsContainerRef.current) {
      const slotElements = slotsContainerRef.current.querySelectorAll('[data-slot-id]');
      let closestId: string | null = null;
      let minDistance = 55; // Proximity snapping radius in px

      slotElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        const expType = el.getAttribute('data-expected-type');
        const isCompatible = expType === 'any' || expType === dragState.tile.type;

        if (dist < minDistance && isCompatible) {
          minDistance = dist;
          closestId = el.getAttribute('data-slot-id');
        }
      });

      setHoveredSlotId(closestId);
    }
  }, [dragState]);

  // Global pointer up listener (handles both Tap and Drop seamlessly)
  const onPointerUp = useCallback(() => {
    if (!dragState) return;

    const { tile, fromSlotId, hasMoved } = dragState;

    if (!hasMoved) {
      // User tapped without significant movement: treat as a TAP!
      if (fromSlotId) {
        handleSlottedTileClick(fromSlotId);
      } else {
        handleTrayTileClick(tile);
      }
    } else if (hoveredSlotId) {
      // Snapped into a slot via drag
      sound.playTileSnap();
      const existingTileInSlot = slotPlacements[hoveredSlotId];

      setSlotPlacements(prev => {
        const next = { ...prev };
        if (fromSlotId && fromSlotId !== hoveredSlotId) {
          delete next[fromSlotId];
        }
        next[hoveredSlotId] = tile;
        return next;
      });

      setTrayTiles(prev => {
        let next = prev.filter(t => t.id !== tile.id);
        // If the slot had another tile, return it to tray
        if (existingTileInSlot && existingTileInSlot.id !== tile.id) {
          next = [...next, existingTileInSlot];
        }
        return next;
      });
    } else {
      // Dragged and dropped outside
      if (fromSlotId) {
        sound.playTilePickup();
        setSlotPlacements(prev => {
          const next = { ...prev };
          delete next[fromSlotId];
          return next;
        });
        setTrayTiles(prev => [...prev, tile]);
      }
    }

    setDragState(null);
    setHoveredSlotId(null);
  }, [dragState, hoveredSlotId, slotPlacements, handleSlottedTileClick, handleTrayTileClick]);

  useEffect(() => {
    if (dragState) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [dragState, onPointerMove, onPointerUp]);

  return (
    <div
      ref={boardRef}
      className="relative z-10 flex flex-col items-center justify-between min-h-[calc(100dvh-68px)] max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 w-full select-none"
    >
      {/* ---------------- Top Zone: Target Card & Hint ---------------- */}
      <div className="w-full flex items-center justify-between bg-white/75 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xs border border-stone-200/80 mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm">
            {level.ageGroup}
          </div>
          <span className="text-stone-600 text-xs sm:text-sm font-medium hidden md:inline truncate max-w-[240px]">
            {level.description}
          </span>
        </div>

        {/* Glowing Target Card */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-baseline gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl shadow-md font-bold">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-200">TARGET</span>
            <span className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {level.target}
            </span>
          </div>

          <button
            onClick={handleUseHint}
            title="Hint lightbulb"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center shadow-xs active:scale-95 hover:bg-amber-100 transition-all shrink-0 cursor-pointer"
          >
            <Lightbulb size={20} className={hintHighlightedTileId ? "animate-bounce text-amber-500" : ""} />
          </button>
        </div>
      </div>

      {/* Optional hint banner */}
      {hintMessage && (
        <div className="w-full bg-amber-50/95 border border-amber-200 rounded-xl px-3 py-2 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between mb-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span>{hintMessage}</span>
          </div>
          <button
            onClick={() => setHintMessage(null)}
            className="text-stone-400 hover:text-stone-600 text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------------- Middle Zone: Equation Frame ---------------- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full my-2 sm:my-4">
        {/* Horizontal Equation Container */}
        <div className="w-full max-w-full overflow-x-auto flex justify-center py-2 px-1">
          <div
            ref={slotsContainerRef}
            className={`flex items-center justify-center flex-nowrap gap-1.5 sm:gap-2.5 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-lg border-2 shadow-md transition-all ${
              isSuccessGlow
                ? 'border-amber-400 animate-pulse-glow bg-amber-50/60'
                : isShaking
                ? 'border-rose-400 animate-shake bg-rose-50/40'
                : 'border-stone-200/90'
            }`}
          >
            {level.slots.map(slot => (
              <Slot
                key={slot.id}
                slot={slot}
                compact={isCompact}
                slottedTile={slotPlacements[slot.id]}
                isHoveredOver={hoveredSlotId === slot.id}
                onTileClick={() => handleSlottedTileClick(slot.id)}
                onPointerDownTile={e =>
                  slotPlacements[slot.id] &&
                  handlePointerDown(e, slotPlacements[slot.id], slot.id)
                }
              />
            ))}

            {/* Equals sign */}
            <div className="text-2xl sm:text-4xl font-extrabold text-stone-500 px-0.5 sm:px-1 select-none shrink-0">
              =
            </div>

            {/* Target display block */}
            <div
              className={`rounded-xl sm:rounded-2xl bg-gradient-to-b from-stone-800 to-stone-900 text-amber-300 font-extrabold flex items-center justify-center shadow-md border-b-2 sm:border-b-4 border-black shrink-0 ${
                isCompact
                  ? 'w-11 h-11 min-w-[44px] min-h-[44px] sm:w-16 sm:h-16 md:w-20 md:h-20 text-lg sm:text-2xl md:text-3xl'
                  : 'w-13 h-13 min-w-[52px] min-h-[52px] sm:w-18 sm:h-18 md:w-20 md:h-20 text-xl sm:text-2xl md:text-3xl'
              }`}
            >
              {level.target}
            </div>
          </div>
        </div>

        {/* Action Controls: Clear & Check Answer */}
        <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            onClick={handleClearBoard}
            title="Clear equation"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs sm:text-sm border border-stone-300/80 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Clear</span>
          </button>

          <button
            onClick={handleCheckAnswer}
            className="tactile-button flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-base sm:text-xl shadow-lg border-b-4 border-emerald-800 active:border-b-0 cursor-pointer"
          >
            <Check size={20} strokeWidth={3} />
            <span>Check Answer</span>
          </button>
        </div>
      </div>

      {/* ---------------- Bottom Zone: Tray of Tiles ---------------- */}
      <div className="w-full bg-stone-100/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-5 border-2 border-stone-200/90 shadow-inner">
        <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-stone-400 mb-2 px-1">
          Tile Tray (Tap to slot or drag)
        </div>

        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3.5 min-h-[60px] sm:min-h-[88px]">
          {trayTiles.map(tile => (
            <div
              key={tile.id}
              className={`transition-transform ${
                hintHighlightedTileId === tile.id ? 'ring-4 ring-amber-400 rounded-xl sm:rounded-2xl scale-110' : ''
              }`}
            >
              <Tile
                tile={tile}
                compact={isCompact}
                onClick={() => handleTrayTileClick(tile)}
                onPointerDown={e => handlePointerDown(e, tile)}
              />
            </div>
          ))}

          {trayTiles.length === 0 && (
            <div className="text-stone-400 text-xs sm:text-sm font-medium italic py-2">
              All tiles placed in the equation!
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Floating Dragged Tile Overlay ---------------- */}
      {dragState && dragState.hasMoved && (
        <div
          style={{
            position: 'fixed',
            left: `${dragState.currentX}px`,
            top: `${dragState.currentY}px`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <Tile tile={dragState.tile} isDragging={true} compact={isCompact} />
        </div>
      )}
    </div>
  );
};
