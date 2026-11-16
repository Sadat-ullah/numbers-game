import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LevelData, TileItem } from '../game/levels/generateAllLevels';
import { MathEvaluator } from '../game/math/evaluator';
import { sound } from '../game/audio/soundEngine';
import { Slot } from './Slot';
import { Tile } from './Tile';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { solveLevel } from '../game/levels/solver';

interface EquationBoardProps {
  level: LevelData;
  hintBalance: number;
  onUseHint: () => void;
  onLevelCompleted: (stars: number) => void;
  onOpenLevelGrid: () => void;
}

interface DragState {
  tile: TileItem;
  fromSlotId?: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
}

export const EquationBoard: React.FC<EquationBoardProps> = ({
  level,
  hintBalance,
  onUseHint,
  onLevelCompleted,
}) => {
  // Map of slotId -> TileItem
  const [slotPlacements, setSlotPlacements] = useState<Record<string, TileItem>>({});
  // Tiles currently in the bottom tray
  const [trayTiles, setTrayTiles] = useState<TileItem[]>(level.trayTiles);
  
  // Dragging state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [nativeDraggingTile, setNativeDraggingTile] = useState<{ tile: TileItem; fromSlotId?: string } | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  // Visual feedback states
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccessGlow, setIsSuccessGlow] = useState(false);
  const isEvaluatingRef = useRef(false);

  // Hint spotlighting
  const [hintSourceTileId, setHintSourceTileId] = useState<string | null>(null);
  const [hintDestinationSlotId, setHintDestinationSlotId] = useState<string | null>(null);
  const [hintArrowCoords, setHintArrowCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [hintsUsedInLevel, setHintsUsedInLevel] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const slotsContainerRef = useRef<HTMLDivElement>(null);

  const isCompact = level.slots.length >= 5;
  const openSlots = level.slots.filter(s => !s.isLocked);

  // Reset state when level changes
  useEffect(() => {
    setSlotPlacements({});
    setTrayTiles([...level.trayTiles]);
    setDragState(null);
    setNativeDraggingTile(null);
    setHoveredSlotId(null);
    setIsShaking(false);
    setIsSuccessGlow(false);
    isEvaluatingRef.current = false;
    setHintSourceTileId(null);
    setHintDestinationSlotId(null);
    setHintArrowCoords(null);
    setHintsUsedInLevel(0);
  }, [level.id]);

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
    setHintSourceTileId(null);
    setHintDestinationSlotId(null);
    setHintArrowCoords(null);
  };

  // Unified drop handler for both HTML5 drag and Pointer drag
  const dropTileIntoSlot = useCallback((tile: TileItem, fromSlotId: string | undefined, targetSlotId: string) => {
    sound.playTileSnap();
    const existingTileInSlot = slotPlacements[targetSlotId];

    setSlotPlacements(prev => {
      const next = { ...prev };
      if (fromSlotId && fromSlotId !== targetSlotId) {
        delete next[fromSlotId];
      }
      next[targetSlotId] = tile;
      return next;
    });

    setTrayTiles(prev => {
      let next = prev.filter(t => t.id !== tile.id);
      if (existingTileInSlot && existingTileInSlot.id !== tile.id) {
        next = [...next, existingTileInSlot];
      }
      return next;
    });

    if (tile.id === hintSourceTileId || targetSlotId === hintDestinationSlotId) {
      setHintSourceTileId(null);
      setHintDestinationSlotId(null);
      setHintArrowCoords(null);
    }
  }, [slotPlacements, hintSourceTileId, hintDestinationSlotId]);

  // -------------------------------------------------------------
  // Automatic Evaluation (Fix 7 - Runs 350ms after final tile snaps)
  // -------------------------------------------------------------
  useEffect(() => {
    const placedCount = Object.keys(slotPlacements).length;
    if (placedCount === openSlots.length && openSlots.length > 0 && !isEvaluatingRef.current && !isSuccessGlow) {
      isEvaluatingRef.current = true;

      const timer = window.setTimeout(() => {
        // Collect tokens in equation order
        const tokens: string[] = [];
        for (const slot of level.slots) {
          if (slot.isLocked) {
            tokens.push(slot.value || '');
          } else {
            const placed = slotPlacements[slot.id];
            if (placed) tokens.push(placed.value);
          }
        }

        const isValid = MathEvaluator.validateEquation(tokens, level.target);

        if (isValid) {
          sound.playLevelSuccess();
          setIsSuccessGlow(true);
          const earnedStars = hintsUsedInLevel === 0 ? 3 : hintsUsedInLevel === 1 ? 2 : 1;
          window.setTimeout(() => {
            onLevelCompleted(earnedStars);
          }, 650);
        } else {
          sound.playInvalidShake();
          setIsShaking(true);
          window.setTimeout(() => {
            setIsShaking(false);
            isEvaluatingRef.current = false;
          }, 500);
        }
      }, 350);

      return () => {
        clearTimeout(timer);
        isEvaluatingRef.current = false;
      };
    } else if (placedCount < openSlots.length) {
      isEvaluatingRef.current = false;
    }
  }, [slotPlacements, openSlots.length, level, hintsUsedInLevel, isSuccessGlow, onLevelCompleted]);

  // -------------------------------------------------------------
  // Limited Hint Activation & High-Visibility Spotlighting (Fix 2 & Fix 8)
  // -------------------------------------------------------------
  const handleActivateHint = () => {
    if (hintBalance <= 0) {
      sound.playInvalidShake();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }

    sound.playTilePickup();
    onUseHint();
    setHintsUsedInLevel(prev => prev + 1);

    const solutions = solveLevel(level);
    if (solutions.length > 0) {
      const sol = solutions[0];
      const unfilled = sol.slotAssignments.find(a => !slotPlacements[a.slotId]);
      if (unfilled) {
        const matchingTrayTile = trayTiles.find(t => t.value === unfilled.tileValue);
        if (matchingTrayTile) {
          setHintSourceTileId(matchingTrayTile.id);
          setHintDestinationSlotId(unfilled.slotId);

          // Calculate visual connector coordinates
          setTimeout(() => {
            const srcEl = document.querySelector(`[data-tile-id="${matchingTrayTile.id}"]`);
            const dstEl = document.querySelector(`[data-slot-id="${unfilled.slotId}"]`);
            if (srcEl && dstEl && boardRef.current) {
              const bRect = boardRef.current.getBoundingClientRect();
              const sRect = srcEl.getBoundingClientRect();
              const dRect = dstEl.getBoundingClientRect();

              setHintArrowCoords({
                x1: sRect.left + sRect.width / 2 - bRect.left,
                y1: sRect.top - bRect.top,
                x2: dRect.left + dRect.width / 2 - bRect.left,
                y2: dRect.bottom - bRect.top,
              });
            }
          }, 50);
        }
      }
    }
  };

  // -------------------------------------------------------------
  // Strict Drag-Only Implementation (Fix 6)
  // -------------------------------------------------------------
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    tile: TileItem,
    fromSlotId?: string
  ) => {
    if (e.button !== 0) return;
    sound.playTilePickup();

    setDragState({
      tile,
      fromSlotId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX - 32,
      currentY: e.clientY - 32,
      hasMoved: false,
    });
  };

  const handleNativeDragStart = (tile: TileItem, fromSlotId?: string) => {
    setNativeDraggingTile({ tile, fromSlotId });
    sound.playTilePickup();
  };

  const handleNativeDrop = (slotId: string) => {
    if (nativeDraggingTile) {
      dropTileIntoSlot(nativeDraggingTile.tile, nativeDraggingTile.fromSlotId, slotId);
      setNativeDraggingTile(null);
    }
  };

  // Pointer move during drag
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragState) return;

    const distMoved = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
    const hasMoved = distMoved > 6 || dragState.hasMoved;

    setDragState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: e.clientX - 32,
        currentY: e.clientY - 32,
        hasMoved,
      };
    });

    if (hasMoved && slotsContainerRef.current) {
      const slotElements = slotsContainerRef.current.querySelectorAll('[data-slot-id]');
      let closestId: string | null = null;
      let minDistance = 60; // Snap proximity threshold in px

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

  // Pointer drop
  const onPointerUp = useCallback(() => {
    if (!dragState) return;

    const { tile, fromSlotId, hasMoved } = dragState;

    if (!hasMoved) {
      if (fromSlotId) {
        handleSlottedTileClick(fromSlotId);
      }
    } else if (hoveredSlotId) {
      dropTileIntoSlot(tile, fromSlotId, hoveredSlotId);
    } else {
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
  }, [dragState, hoveredSlotId, dropTileIntoSlot, handleSlottedTileClick]);

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
      data-testid="equation-board"
      className="relative z-10 flex flex-col items-center justify-between min-h-[calc(100dvh-64px)] max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 w-full select-none touch-none"
    >
      {/* ---------------- Top Zone: Target Card & Hint Balance ---------------- */}
      <div className="w-full flex items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xs border border-stone-200/90 mb-3 sm:mb-5 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-extrabold text-stone-700">
            Level {level.id}
          </span>
        </div>

        {/* Glowing Target Card */}
        <div className="flex items-center gap-3">
          <div
            data-testid="target-card"
            className="flex items-baseline gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-2xl shadow-md font-extrabold"
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-200">TARGET</span>
            <span className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {level.target}
            </span>
          </div>

          {/* Limited Hint Button (Fix 2 & Fix 8) */}
          <button
            onClick={handleActivateHint}
            data-testid="hint-button"
            title={hintBalance > 0 ? `Use Hint (${hintBalance} left)` : "No hints left"}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-base border-2 transition-all cursor-pointer ${
              hintBalance > 0
                ? 'bg-amber-100/90 border-amber-400 text-amber-900 shadow-xs active:scale-95 hover:bg-amber-200'
                : 'bg-stone-200/80 border-stone-300 text-stone-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Lightbulb size={18} className={hintBalance > 0 ? "fill-amber-500 text-amber-600" : ""} />
            <span data-testid="hint-counter">{hintBalance}</span>
          </button>
        </div>
      </div>

      {/* ---------------- Middle Zone: Enlarged Game Arena (Fix 9) ---------------- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full my-auto py-2">
        <div
          style={{ width: 'min(94vw, 820px)' }}
          className="flex justify-center items-center py-2 px-1 overflow-x-auto"
        >
          <div
            ref={slotsContainerRef}
            data-testid="equation-container"
            className={`flex items-center justify-center flex-nowrap gap-2 sm:gap-4 p-4 sm:p-7 rounded-3xl bg-white/90 backdrop-blur-xl border-3 shadow-xl transition-all ${
              isSuccessGlow
                ? 'border-amber-400 animate-pulse-glow bg-amber-50/70'
                : isShaking
                ? 'border-rose-400 animate-elastic-shake bg-rose-50/50'
                : 'border-stone-200'
            }`}
          >
            {level.slots.map(slot => (
              <Slot
                key={slot.id}
                slot={slot}
                compact={isCompact}
                isHintTarget={hintDestinationSlotId === slot.id}
                slottedTile={slotPlacements[slot.id]}
                isHoveredOver={hoveredSlotId === slot.id}
                onTileClick={() => handleSlottedTileClick(slot.id)}
                onPointerDownTile={e =>
                  slotPlacements[slot.id] &&
                  handlePointerDown(e, slotPlacements[slot.id], slot.id)
                }
                onDragStartTile={() =>
                  slotPlacements[slot.id] &&
                  handleNativeDragStart(slotPlacements[slot.id], slot.id)
                }
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setHoveredSlotId(slot.id);
                }}
                onDragLeave={() => {
                  if (hoveredSlotId === slot.id) setHoveredSlotId(null);
                }}
                onDrop={e => {
                  e.preventDefault();
                  setHoveredSlotId(null);
                  try {
                    const raw = e.dataTransfer.getData('application/json');
                    if (raw) {
                      const parsed = JSON.parse(raw);
                      if (parsed && parsed.tile) {
                        dropTileIntoSlot(parsed.tile, parsed.fromSlotId, slot.id);
                        return;
                      }
                    }
                  } catch {}
                  handleNativeDrop(slot.id);
                }}
              />
            ))}

            {/* Equals sign */}
            <div className="text-3xl sm:text-5xl font-extrabold text-stone-500 px-1 sm:px-2 select-none shrink-0">
              =
            </div>

            {/* Target block */}
            <div
              data-testid="target-block"
              className={`rounded-2xl sm:rounded-3xl bg-gradient-to-b from-stone-800 to-stone-950 text-amber-300 font-extrabold flex items-center justify-center shadow-lg border-b-4 border-black shrink-0 ${
                isCompact
                  ? 'w-13 h-13 min-w-[52px] min-h-[52px] sm:w-18 sm:h-18 md:w-22 md:h-22 text-xl sm:text-3xl'
                  : 'w-16 h-16 min-w-[64px] min-h-[64px] sm:w-22 sm:h-22 md:w-26 md:h-26 text-2xl sm:text-4xl'
              }`}
            >
              {level.target}
            </div>
          </div>
        </div>

        {/* Clear control */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleClearBoard}
            data-testid="clear-button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-extrabold text-xs sm:text-sm border border-stone-300 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ---------------- Animated Hint Trail Connector (Fix 8) ---------------- */}
      {hintArrowCoords && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="hint-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
            </marker>
          </defs>
          <path
            d={`M ${hintArrowCoords.x1} ${hintArrowCoords.y1} Q ${(hintArrowCoords.x1 + hintArrowCoords.x2) / 2} ${(hintArrowCoords.y1 + hintArrowCoords.y2) / 2 - 40} ${hintArrowCoords.x2} ${hintArrowCoords.y2}`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeDasharray="8 6"
            className="animate-dash"
            markerEnd="url(#hint-arrowhead)"
          />
        </svg>
      )}

      {/* ---------------- Bottom Zone: Tray of Draggable Tiles ---------------- */}
      <div
        data-testid="tile-tray"
        className="w-full bg-stone-100/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-5 border-2 border-stone-200/90 shadow-inner"
      >
        <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-4 min-h-[64px] sm:min-h-[96px]">
          {trayTiles.map(tile => (
            <Tile
              key={tile.id}
              tile={tile}
              compact={isCompact}
              isHintTarget={hintSourceTileId === tile.id}
              onPointerDown={e => handlePointerDown(e, tile)}
              onDragStart={() => handleNativeDragStart(tile)}
            />
          ))}

          {trayTiles.length === 0 && (
            <div className="text-stone-400 text-xs sm:text-sm font-semibold italic py-2">
              All tiles placed
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Floating Dragged Tile Overlay ---------------- */}
      {dragState && dragState.hasMoved && (
        <div
          data-testid="dragged-tile-overlay"
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
