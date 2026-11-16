import { describe, it, expect } from 'vitest';
import { MathEvaluator } from '../../math/evaluator';
import { buildAllLevels } from '../generateAllLevels';
import { solveLevel } from '../solver';

describe('MathEvaluator', () => {
  it('correctly evaluates simple operations', () => {
    expect(MathEvaluator.evaluate(['2', '+', '3'])).toBe(5);
    expect(MathEvaluator.evaluate(['10', '-', '4'])).toBe(6);
    expect(MathEvaluator.evaluate(['6', '×', '7'])).toBe(42);
    expect(MathEvaluator.evaluate(['36', '÷', '6'])).toBe(6);
  });

  it('respects BODMAS precedence: multiplication before addition', () => {
    expect(MathEvaluator.evaluate(['2', '+', '3', '×', '4'])).toBe(14);
    expect(MathEvaluator.evaluate(['3', '×', '4', '+', '2'])).toBe(14);
    expect(MathEvaluator.evaluate(['20', '-', '4', '×', '3'])).toBe(8);
  });

  it('handles division precedence and rejects division by zero', () => {
    expect(MathEvaluator.evaluate(['10', '+', '12', '÷', '3'])).toBe(14);
    expect(MathEvaluator.evaluate(['10', '÷', '0'])).toBeNull();
  });

  it('validates targets with commutative variations', () => {
    expect(MathEvaluator.validateEquation(['2', '+', '3', '+', '5'], 10)).toBe(true);
    expect(MathEvaluator.validateEquation(['5', '+', '2', '+', '3'], 10)).toBe(true);
    expect(MathEvaluator.validateEquation(['3', '+', '5', '+', '2'], 10)).toBe(true);
    expect(MathEvaluator.validateEquation(['5', '+', '5', '+', '2'], 10)).toBe(false);
  });
});

describe('100-Level Solvability Suite', () => {
  const allLevels = buildAllLevels();

  it('contains exactly 100 levels spanning 10 worlds', () => {
    expect(allLevels.length).toBe(100);
    const worlds = new Set(allLevels.map(l => l.world));
    expect(worlds.size).toBe(10);
  });

  it('guarantees every single level from 1 to 100 has at least 1 valid solution', () => {
    const unsolvableLevels: number[] = [];

    for (const level of allLevels) {
      const solutions = solveLevel(level);
      if (solutions.length === 0) {
        unsolvableLevels.push(level.id);
      }
    }

    expect(unsolvableLevels).toEqual([]);
  });
});
