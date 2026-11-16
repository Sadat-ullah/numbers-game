import { LevelData } from './generateAllLevels';
import { MathEvaluator } from '../math/evaluator';

export interface SolvedConfiguration {
  slotAssignments: { slotId: string; tileValue: string }[];
  evaluatedResult: number;
}

/**
 * Finds all mathematically valid tile arrangements for a given level.
 */
export function solveLevel(level: LevelData): SolvedConfiguration[] {
  const openSlots = level.slots.filter(s => !s.isLocked);
  const solutions: SolvedConfiguration[] = [];

  function permute(
    slotIdx: number,
    usedTileIds: Set<string>,
    currentAssignments: { slotId: string; tileValue: string }[]
  ) {
    if (slotIdx === openSlots.length) {
      // Assemble full token list for the equation
      const tokens: string[] = [];
      for (const slot of level.slots) {
        if (slot.isLocked) {
          tokens.push(slot.value || '');
        } else {
          const found = currentAssignments.find(a => a.slotId === slot.id);
          tokens.push(found ? found.tileValue : '');
        }
      }

      if (MathEvaluator.validateEquation(tokens, level.target)) {
        solutions.push({
          slotAssignments: [...currentAssignments],
          evaluatedResult: level.target,
        });
      }
      return;
    }

    const currentSlot = openSlots[slotIdx];
    for (const tile of level.trayTiles) {
      if (usedTileIds.has(tile.id)) continue;

      // Check slot type constraint
      if (currentSlot.expectedType !== 'any' && currentSlot.expectedType !== tile.type) {
        continue;
      }

      usedTileIds.add(tile.id);
      currentAssignments.push({ slotId: currentSlot.id, tileValue: tile.value });

      permute(slotIdx + 1, usedTileIds, currentAssignments);

      currentAssignments.pop();
      usedTileIds.delete(tile.id);

      // Optimization: if we already found 5 solutions, that is enough to prove solvency
      if (solutions.length >= 5) return;
    }
  }

  permute(0, new Set(), []);
  return solutions;
}
