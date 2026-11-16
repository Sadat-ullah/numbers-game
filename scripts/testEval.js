import { MathEvaluator } from '../src/game/math/evaluator.js';

// Test harness for solver verification
console.log("Testing MathEvaluator basics:");
console.log("2 + 3 * 4 =", MathEvaluator.evaluate(["2", "+", "3", "×", "4"])); // Should be 14
console.log("20 / 4 =", MathEvaluator.evaluate(["20", "÷", "4"])); // Should be 5
console.log("15 - 7 =", MathEvaluator.evaluate(["15", "-", "7"])); // Should be 8
