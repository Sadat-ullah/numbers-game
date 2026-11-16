export type Operator = '+' | '-' | '×' | '÷' | '*' | '/';

export interface Token {
  type: 'number' | 'operator';
  value: string;
}

export class MathEvaluator {
  /**
   * Normalizes operators to standard symbols: + - * /
   */
  private static normalizeOp(op: string): string {
    if (op === '×') return '*';
    if (op === '÷') return '/';
    return op;
  }

  private static precedence(op: string): number {
    const normalized = this.normalizeOp(op);
    if (normalized === '*' || normalized === '/') return 2;
    if (normalized === '+' || normalized === '-') return 1;
    return 0;
  }

  /**
   * Evaluates an array of token strings e.g. ["2", "+", "3", "×", "4"]
   * Using Dijkstra's Shunting-Yard algorithm for proper BODMAS evaluation.
   * Returns the numerical result or null if the expression is syntactically invalid.
   */
  public static evaluate(tokens: string[]): number | null {
    if (!tokens || tokens.length === 0) return null;

    // Remove any empty/null tokens
    const cleanTokens = tokens.filter(t => t !== undefined && t !== null && t.trim() !== '');
    if (cleanTokens.length === 0) return null;

    const outputQueue: number[] = [];
    const operatorStack: string[] = [];

    // Syntactic sanity check: First and last cannot be binary operators
    const firstOp = this.normalizeOp(cleanTokens[0]);
    const lastOp = this.normalizeOp(cleanTokens[cleanTokens.length - 1]);
    if (['+', '-', '*', '/'].includes(firstOp) && cleanTokens.length === 1) return null;
    if (['+', '-', '*', '/'].includes(lastOp)) return null;

    for (let i = 0; i < cleanTokens.length; i++) {
      const token = cleanTokens[i];
      const num = Number(token);

      if (!isNaN(num) && token.trim() !== '') {
        // It is a number
        outputQueue.push(num);
      } else {
        // Operator
        const op = this.normalizeOp(token);
        if (!['+', '-', '*', '/'].includes(op)) {
          return null; // Unknown token
        }

        while (
          operatorStack.length > 0 &&
          this.precedence(operatorStack[operatorStack.length - 1]) >= this.precedence(op)
        ) {
          const topOp = operatorStack.pop()!;
          if (!this.applyOp(outputQueue, topOp)) return null;
        }
        operatorStack.push(op);
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop()!;
      if (!this.applyOp(outputQueue, op)) return null;
    }

    if (outputQueue.length !== 1) return null;
    return outputQueue[0];
  }

  private static applyOp(stack: number[], op: string): boolean {
    if (stack.length < 2) return false;
    const b = stack.pop()!;
    const a = stack.pop()!;

    switch (op) {
      case '+':
        stack.push(a + b);
        return true;
      case '-':
        stack.push(a - b);
        return true;
      case '*':
        stack.push(a * b);
        return true;
      case '/':
        if (Math.abs(b) < 1e-12) return false; // Prevent division by zero
        stack.push(a / b);
        return true;
      default:
        return false;
    }
  }

  /**
   * Validates if a completed equation evaluates to the target.
   */
  public static validateEquation(tokens: string[], target: number): boolean {
    const result = this.evaluate(tokens);
    if (result === null) return false;
    return Math.abs(result - target) < 1e-7;
  }
}
