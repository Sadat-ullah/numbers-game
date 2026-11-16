export interface SlotDefinition {
  id: string;
  expectedType: 'number' | 'operator' | 'any';
  isLocked: boolean;
  value?: string;
}

export interface TileItem {
  id: string;
  value: string;
  type: 'number' | 'operator';
}

export interface LevelData {
  id: number;
  world: number;
  worldTitle: string;
  worldThemeColor: string;
  target: number;
  description: string;
  slots: SlotDefinition[];
  trayTiles: TileItem[];
  hintText: string;
}

function numTile(id: string, val: string | number): TileItem {
  return { id, value: String(val), type: 'number' };
}

function opTile(id: string, op: string): TileItem {
  return { id, value: op, type: 'operator' };
}

export const WORLD_METADATA = [
  { world: 1, title: "Starter Workshop", color: "#F97316", desc: "Two numbers + addition" },
  { world: 2, title: "Addition Atelier", color: "#06B6D4", desc: "Addition" },
  { world: 3, title: "Subtraction Studio", color: "#EC4899", desc: "Subtraction" },
  { world: 4, title: "Trio Tower", color: "#8B5CF6", desc: "Three numbers" },
  { world: 5, title: "Multiplication Mill", color: "#EAB308", desc: "Multiplication" },
  { world: 6, title: "BODMAS Bridge", color: "#10B981", desc: "Order of operations" },
  { world: 7, title: "Division Foundry", color: "#3B82F6", desc: "Division" },
  { world: 8, title: "Architect Academy", color: "#6366F1", desc: "Four operations" },
  { world: 9, title: "Master Blueprint", color: "#D946EF", desc: "Numbers & operators" },
  { world: 10, title: "Infinity Vault", color: "#F43F5E", desc: "Special challenges" },
];

/**
 * Builds the static 100-level progression matrix adhering strictly
 * to the pedagogical specs and constraint rules in the implementation plan.
 */
export function buildAllLevels(): LevelData[] {
  const levels: LevelData[] = [];

  // -------------------------------------------------------------
  // World 1: Levels 1–10
  // Two numbers + one pre-filled addition operator: [ ] + [ ] = Target
  // -------------------------------------------------------------
  const w1Targets = [
    { target: 3, a: 1, b: 2, dist: [4] },
    { target: 4, a: 2, b: 2, dist: [5] },
    { target: 5, a: 2, b: 3, dist: [1] },
    { target: 6, a: 4, b: 2, dist: [7] },
    { target: 7, a: 3, b: 4, dist: [2] },
    { target: 8, a: 5, b: 3, dist: [6] },
    { target: 9, a: 4, b: 5, dist: [3] },
    { target: 10, a: 6, b: 4, dist: [8] },
    { target: 10, a: 7, b: 3, dist: [5] },
    { target: 10, a: 8, b: 2, dist: [1] },
  ];

  w1Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 1;
    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-1`, cfg.a),
      numTile(`t-${lvlNum}-2`, cfg.b),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 13) % 17) / 17);

    levels.push({
      id: lvlNum,
      world: 1,
      worldTitle: WORLD_METADATA[0].title,
      worldThemeColor: WORLD_METADATA[0].color,
      target: cfg.target,
      description: `Build ${cfg.target} using addition!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Look for two numbers that combine to equal ${cfg.target}.`,
    });
  });

  // -------------------------------------------------------------
  // World 2: Levels 11–20
  // Larger addition combinations: [ ] + [ ] = Target (4 numbers + distractor operator)
  // -------------------------------------------------------------
  const w2Targets = [
    { target: 11, a: 5, b: 6, dist: [3, 8] },
    { target: 12, a: 7, b: 5, dist: [4, 9] },
    { target: 13, a: 9, b: 4, dist: [6, 2] },
    { target: 14, a: 8, b: 6, dist: [5, 11] },
    { target: 15, a: 7, b: 8, dist: [6, 10] },
    { target: 16, a: 9, b: 7, dist: [4, 12] },
    { target: 17, a: 8, b: 9, dist: [7, 11] },
    { target: 18, a: 11, b: 7, dist: [9, 13] },
    { target: 19, a: 12, b: 7, dist: [8, 14] },
    { target: 20, a: 13, b: 7, dist: [10, 15] },
  ];

  w2Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 11;
    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-1`, cfg.a),
      numTile(`t-${lvlNum}-2`, cfg.b),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
      opTile(`t-${lvlNum}-op`, '-'), // distractor operator
    ].sort(() => 0.5 - ((lvlNum * 7) % 19) / 19);

    levels.push({
      id: lvlNum,
      world: 2,
      worldTitle: WORLD_METADATA[1].title,
      worldThemeColor: WORLD_METADATA[1].color,
      target: cfg.target,
      description: `Make the sum equal ${cfg.target}. Beware of distractor tiles!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Two numbers sum to ${cfg.target}. Avoid subtraction!`,
    });
  });

  // -------------------------------------------------------------
  // World 3: Levels 21–30
  // Subtraction constructions: [ ] - [ ] = Target (correct operand order)
  // -------------------------------------------------------------
  const w3Targets = [
    { target: 3, a: 10, b: 7, dist: [5, 2] },
    { target: 4, a: 12, b: 8, dist: [6, 3] },
    { target: 5, a: 14, b: 9, dist: [7, 4] },
    { target: 6, a: 15, b: 9, dist: [8, 5] },
    { target: 7, a: 16, b: 9, dist: [11, 4] },
    { target: 8, a: 15, b: 7, dist: [6, 12] },
    { target: 9, a: 18, b: 9, dist: [8, 14] },
    { target: 10, a: 22, b: 12, dist: [15, 8] },
    { target: 11, a: 25, b: 14, dist: [12, 9] },
    { target: 12, a: 20, b: 8, dist: [14, 5] },
  ];

  w3Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 21;
    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-1`, cfg.a),
      numTile(`t-${lvlNum}-2`, cfg.b),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 11) % 23) / 23);

    levels.push({
      id: lvlNum,
      world: 3,
      worldTitle: WORLD_METADATA[2].title,
      worldThemeColor: WORLD_METADATA[2].color,
      target: cfg.target,
      description: `Subtract to get ${cfg.target}. Remember: larger number goes first!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op`, expectedType: 'operator', isLocked: true, value: '-' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Place the larger number on the left so subtracting leaves ${cfg.target}.`,
    });
  });

  // -------------------------------------------------------------
  // World 4: Levels 31–40
  // Three-number equations: [ ] + [ ] + [ ] = Target (commutative)
  // -------------------------------------------------------------
  const w4Targets = [
    { target: 10, nums: [2, 3, 5], dist: [4, 7] },
    { target: 12, nums: [3, 4, 5], dist: [2, 8] },
    { target: 14, nums: [2, 5, 7], dist: [3, 6] },
    { target: 15, nums: [4, 5, 6], dist: [2, 9] },
    { target: 16, nums: [3, 6, 7], dist: [5, 8] },
    { target: 18, nums: [4, 6, 8], dist: [5, 9] },
    { target: 20, nums: [5, 7, 8], dist: [6, 11] },
    { target: 21, nums: [6, 7, 8], dist: [4, 12] },
    { target: 24, nums: [7, 8, 9], dist: [5, 13] },
    { target: 25, nums: [6, 9, 10], dist: [7, 12] },
  ];

  w4Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 31;
    const tiles: TileItem[] = [
      ...cfg.nums.map((n, nIdx) => numTile(`t-${lvlNum}-n${nIdx}`, n)),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 5) % 29) / 29);

    levels.push({
      id: lvlNum,
      world: 4,
      worldTitle: WORLD_METADATA[3].title,
      worldThemeColor: WORLD_METADATA[3].color,
      target: cfg.target,
      description: `Combine three numbers to reach ${cfg.target}. Order doesn't matter!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-3`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Find 3 numbers that together add up to ${cfg.target}.`,
    });
  });

  // -------------------------------------------------------------
  // World 5: Levels 41–50
  // Multiplication constructions: [ ] × [ ] = Target
  // -------------------------------------------------------------
  const w5Targets = [
    { target: 12, a: 3, b: 4, dist: [5, 6, 2] },
    { target: 15, a: 3, b: 5, dist: [4, 7, 8] },
    { target: 18, a: 3, b: 6, dist: [5, 8, 9] },
    { target: 20, a: 4, b: 5, dist: [6, 3, 10] },
    { target: 24, a: 4, b: 6, dist: [7, 5, 8] },
    { target: 28, a: 4, b: 7, dist: [6, 9, 5] },
    { target: 30, a: 5, b: 6, dist: [4, 8, 7] },
    { target: 36, a: 6, b: 6, dist: [5, 7, 8] },
    { target: 42, a: 6, b: 7, dist: [8, 5, 9] },
    { target: 48, a: 6, b: 8, dist: [7, 9, 4] },
  ];

  w5Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 41;
    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-1`, cfg.a),
      numTile(`t-${lvlNum}-2`, cfg.b),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 17) % 31) / 31);

    levels.push({
      id: lvlNum,
      world: 5,
      worldTitle: WORLD_METADATA[4].title,
      worldThemeColor: WORLD_METADATA[4].color,
      target: cfg.target,
      description: `Multiply two factors to construct ${cfg.target}!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op`, expectedType: 'operator', isLocked: true, value: '×' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Which multiplication fact equals ${cfg.target}?`,
    });
  });

  // -------------------------------------------------------------
  // World 6: Levels 51–60
  // Mixed precedence equations: [ ] + [ ] × [ ] = Target (BODMAS: multiply first!)
  // -------------------------------------------------------------
  const w6Targets = [
    { target: 14, add: 2, m1: 3, m2: 4, dist: [5, 6] },   // 2 + 3 * 4 = 14
    { target: 17, add: 5, m1: 3, m2: 4, dist: [2, 6] },   // 5 + 3 * 4 = 17
    { target: 20, add: 8, m1: 4, m2: 3, dist: [6, 5] },   // 8 + 4 * 3 = 20
    { target: 22, add: 7, m1: 3, m2: 5, dist: [4, 8] },   // 7 + 3 * 5 = 22
    { target: 26, add: 6, m1: 4, m2: 5, dist: [3, 7] },   // 6 + 4 * 5 = 26
    { target: 29, add: 5, m1: 4, m2: 6, dist: [7, 8] },   // 5 + 4 * 6 = 29
    { target: 33, add: 9, m1: 4, m2: 6, dist: [5, 8] },   // 9 + 4 * 6 = 33
    { target: 35, add: 5, m1: 5, m2: 6, dist: [4, 7] },   // 5 + 5 * 6 = 35
    { target: 38, add: 8, m1: 5, m2: 6, dist: [6, 9] },   // 8 + 5 * 6 = 38
    { target: 45, add: 5, m1: 8, m2: 5, dist: [6, 7] },   // 5 + 8 * 5 = 45
  ];

  w6Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 51;
    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-add`, cfg.add),
      numTile(`t-${lvlNum}-m1`, cfg.m1),
      numTile(`t-${lvlNum}-m2`, cfg.m2),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 19) % 37) / 37);

    levels.push({
      id: lvlNum,
      world: 6,
      worldTitle: WORLD_METADATA[5].title,
      worldThemeColor: WORLD_METADATA[5].color,
      target: cfg.target,
      description: `BODMAS Rule: Multiplication happens before addition!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: true, value: '×' },
        { id: `s-${lvlNum}-3`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Multiply the second and third numbers first, then add the first number!`,
    });
  });

  // -------------------------------------------------------------
  // World 7: Levels 61–70
  // Division constructions: [ ] ÷ [ ] = Target (whole-number division pairs)
  // -------------------------------------------------------------
  const w7Targets = [
    { target: 4, a: 24, b: 6, dist: [3, 8, 12, 18] },
    { target: 5, a: 35, b: 7, dist: [6, 8, 30, 40] },
    { target: 6, a: 42, b: 7, dist: [8, 9, 36, 48] },
    { target: 7, a: 56, b: 8, dist: [6, 9, 49, 64] },
    { target: 8, a: 72, b: 9, dist: [7, 6, 54, 63] },
    { target: 9, a: 63, b: 7, dist: [8, 6, 56, 72] },
    { target: 12, a: 60, b: 5, dist: [4, 6, 48, 70] },
    { target: 14, a: 42, b: 3, dist: [4, 7, 36, 50] },
    { target: 15, a: 75, b: 5, dist: [6, 8, 60, 80] },
    { target: 16, a: 64, b: 4, dist: [5, 8, 56, 72] },
  ];

  w7Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 61;
    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-1`, cfg.a),
      numTile(`t-${lvlNum}-2`, cfg.b),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 23) % 41) / 41);

    levels.push({
      id: lvlNum,
      world: 7,
      worldTitle: WORLD_METADATA[6].title,
      worldThemeColor: WORLD_METADATA[6].color,
      target: cfg.target,
      description: `Divide evenly to reach ${cfg.target}. Only whole-number pairs!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op`, expectedType: 'operator', isLocked: true, value: '÷' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `${cfg.target} times which denominator equals the numerator?`,
    });
  });

  // -------------------------------------------------------------
  // World 8: Levels 71–80
  // All four operations with locked anchor tiles: Anchor + [ ] ÷ [ ] = Target
  // -------------------------------------------------------------
  const w8Targets = [
    { target: 23, anchor: 20, a: 18, b: 6, dist: [4, 8, 12] }, // 20 + 18 ÷ 6 = 23
    { target: 25, anchor: 19, a: 24, b: 4, dist: [5, 7, 18] }, // 19 + 24 ÷ 4 = 25
    { target: 30, anchor: 14, a: 32, b: 2, dist: [6, 8, 20] }, // 14 + 32 ÷ 2 = 30
    { target: 15, anchor: 25, a: 40, b: 4, dist: [5, 8, 20], op: '-' }, // 25 - 40 ÷ 4 = 15
    { target: 18, anchor: 30, a: 36, b: 3, dist: [6, 9, 24], op: '-' }, // 30 - 36 ÷ 3 = 18
    { target: 35, anchor: 5, a: 6, b: 5, dist: [4, 7, 25], op: '+' }, // 5 + 6 × 5 = 35
    { target: 42, anchor: 10, a: 4, b: 8, dist: [5, 7, 30], op: '+' }, // 10 + 4 × 8 = 42
    { target: 30, anchor: 50, a: 4, b: 5, dist: [6, 8, 22], op: '-' }, // 50 - 4 × 5 = 30
    { target: 40, anchor: 12, a: 7, b: 4, dist: [6, 8, 24], op: '+' }, // 12 + 7 × 4 = 40
    { target: 50, anchor: 14, a: 9, b: 4, dist: [5, 8, 32], op: '+' }, // 14 + 9 × 4 = 50
  ];

  w8Targets.forEach((cfg, idx) => {
    const lvlNum = idx + 71;
    const op1 = cfg.op || '+';
    const isMult = lvlNum >= 76;
    const op2 = isMult ? '×' : '÷';

    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-1`, cfg.a),
      numTile(`t-${lvlNum}-2`, cfg.b),
      ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 29) % 43) / 43);

    levels.push({
      id: lvlNum,
      world: 8,
      worldTitle: WORLD_METADATA[7].title,
      worldThemeColor: WORLD_METADATA[7].color,
      target: cfg.target,
      description: `Anchor tile is locked! Complete the equation to reach ${cfg.target}.`,
      slots: [
        { id: `s-${lvlNum}-anchor`, expectedType: 'number', isLocked: true, value: String(cfg.anchor) },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: true, value: op1 },
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: true, value: op2 },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Solve the ${op2} expression first, then ${op1 === '+' ? 'add to' : 'subtract from'} ${cfg.anchor}!`,
    });
  });

  // -------------------------------------------------------------
  // World 9: Levels 81–94
  // Multi-blank operator + number: [ ] [op] 5 [op] [ ] = Target
  // -------------------------------------------------------------
  const w9Configs = [
    { target: 40, n1: 9, op1: '×', anchor: 5, op2: '-', n2: 5, distN: [7, 8], distOp: ['+'] }, // 9 × 5 - 5 = 40
    { target: 42, n1: 8, op1: '×', anchor: 5, op2: '+', n2: 2, distN: [6, 4], distOp: ['-'] }, // 8 × 5 + 2 = 42
    { target: 35, n1: 7, op1: '×', anchor: 6, op2: '-', n2: 7, distN: [5, 8], distOp: ['+'] }, // 7 × 6 - 7 = 35
    { target: 50, n1: 8, op1: '×', anchor: 6, op2: '+', n2: 2, distN: [4, 7], distOp: ['-'] }, // 8 × 6 + 2 = 50
    { target: 30, n1: 6, op1: '×', anchor: 4, op2: '+', n2: 6, distN: [5, 8], distOp: ['-'] }, // 6 × 4 + 6 = 30
    { target: 25, n1: 4, op1: '×', anchor: 7, op2: '-', n2: 3, distN: [5, 6], distOp: ['+'] }, // 4 × 7 - 3 = 25
    { target: 36, n1: 5, op1: '×', anchor: 8, op2: '-', n2: 4, distN: [6, 7], distOp: ['+'] }, // 5 × 8 - 4 = 36
    { target: 48, n1: 7, op1: '×', anchor: 7, op2: '-', n2: 1, distN: [5, 8], distOp: ['+'] }, // 7 × 7 - 1 = 48
    { target: 55, n1: 9, op1: '×', anchor: 6, op2: '+', n2: 1, distN: [4, 8], distOp: ['-'] }, // 9 × 6 + 1 = 55
    { target: 60, n1: 8, op1: '×', anchor: 8, op2: '-', n2: 4, distN: [5, 7], distOp: ['+'] }, // 8 × 8 - 4 = 60
    { target: 62, n1: 9, op1: '×', anchor: 7, op2: '-', n2: 1, distN: [4, 6], distOp: ['+'] }, // 9 × 7 - 1 = 62
    { target: 65, n1: 8, op1: '×', anchor: 7, op2: '+', n2: 9, distN: [5, 6], distOp: ['-'] }, // 8 × 7 + 9 = 65
    { target: 70, n1: 9, op1: '×', anchor: 8, op2: '-', n2: 2, distN: [4, 7], distOp: ['+'] }, // 9 × 8 - 2 = 70
    { target: 75, n1: 9, op1: '×', anchor: 8, op2: '+', n2: 3, distN: [5, 6], distOp: ['-'] }, // 9 × 8 + 3 = 75
  ];

  w9Configs.forEach((cfg, idx) => {
    const lvlNum = idx + 81;
    const tiles: TileItem[] = [
      numTile(`t-${lvlNum}-n1`, cfg.n1),
      numTile(`t-${lvlNum}-n2`, cfg.n2),
      ...cfg.distN.map((d, dIdx) => numTile(`t-${lvlNum}-dn${dIdx}`, d)),
      opTile(`t-${lvlNum}-op1`, cfg.op1),
      opTile(`t-${lvlNum}-op2`, cfg.op2),
      ...cfg.distOp.map((d, dIdx) => opTile(`t-${lvlNum}-dop${dIdx}`, d)),
    ].sort(() => 0.5 - ((lvlNum * 31) % 47) / 47);

    levels.push({
      id: lvlNum,
      world: 9,
      worldTitle: WORLD_METADATA[8].title,
      worldThemeColor: WORLD_METADATA[8].color,
      target: cfg.target,
      description: `Place both numbers and operators around the center anchor ${cfg.anchor}!`,
      slots: [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: false },
        { id: `s-${lvlNum}-anchor`, expectedType: 'number', isLocked: true, value: String(cfg.anchor) },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: false },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
      ],
      trayTiles: tiles,
      hintText: `Use multiplication first to get close to ${cfg.target}, then add or subtract the remainder!`,
    });
  });

  // -------------------------------------------------------------
  // World 10: Levels 95–100
  // Zero, one & multi-step twists: [ ] × 0 + [ ] = Target
  // -------------------------------------------------------------
  const w10Configs = [
    { target: 5, mult: 7, zero: 0, add: 5, dist: [2, 3, 9] },  // 7 × 0 + 5 = 5
    { target: 8, mult: 9, zero: 0, add: 8, dist: [3, 4, 10] }, // 9 × 0 + 8 = 8
    { target: 12, mult: 15, zero: 0, add: 12, dist: [5, 6, 18] },// 15 × 0 + 12 = 12
    { target: 1, mult: 6, div: 6, add: 0, dist: [2, 4, 8] },    // 6 ÷ 6 + 0 = 1
    { target: 20, mult: 20, one: 1, add: 0, dist: [5, 10, 15] },// 20 × 1 + 0 = 20
    { target: 100, mult: 10, m2: 10, zero: 0, dist: [2, 5, 20] },// 10 × 10 + 0 = 100
  ];

  w10Configs.forEach((cfg, idx) => {
    const lvlNum = idx + 95;
    let tiles: TileItem[] = [];
    let slots: SlotDefinition[] = [];

    if (lvlNum <= 97) {
      tiles = [
        numTile(`t-${lvlNum}-m`, cfg.mult ?? 0),
        numTile(`t-${lvlNum}-z`, cfg.zero ?? 0),
        numTile(`t-${lvlNum}-a`, cfg.add ?? 0),
        ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
      ];
      slots = [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: true, value: '×' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-3`, expectedType: 'number', isLocked: false },
      ];
    } else if (lvlNum === 98) {
      tiles = [
        numTile(`t-${lvlNum}-1`, "6"),
        numTile(`t-${lvlNum}-2`, "6"),
        numTile(`t-${lvlNum}-3`, "0"),
        ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
      ];
      slots = [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: true, value: '÷' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-3`, expectedType: 'number', isLocked: false },
      ];
    } else if (lvlNum === 99) {
      tiles = [
        numTile(`t-${lvlNum}-1`, "20"),
        numTile(`t-${lvlNum}-2`, "1"),
        numTile(`t-${lvlNum}-3`, "0"),
        ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
      ];
      slots = [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: true, value: '×' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-3`, expectedType: 'number', isLocked: false },
      ];
    } else {
      // Level 100: Grand Finale (Target = 100)
      tiles = [
        numTile(`t-${lvlNum}-1`, "10"),
        numTile(`t-${lvlNum}-2`, "10"),
        numTile(`t-${lvlNum}-3`, "0"),
        ...cfg.dist.map((d, dIdx) => numTile(`t-${lvlNum}-d${dIdx}`, d)),
      ];
      slots = [
        { id: `s-${lvlNum}-1`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op1`, expectedType: 'operator', isLocked: true, value: '×' },
        { id: `s-${lvlNum}-2`, expectedType: 'number', isLocked: false },
        { id: `s-${lvlNum}-op2`, expectedType: 'operator', isLocked: true, value: '+' },
        { id: `s-${lvlNum}-3`, expectedType: 'number', isLocked: false },
      ];
    }

    tiles.sort(() => 0.5 - ((lvlNum * 37) % 53) / 53);

    levels.push({
      id: lvlNum,
      world: 10,
      worldTitle: WORLD_METADATA[9].title,
      worldThemeColor: WORLD_METADATA[9].color,
      target: cfg.target,
      description: `Infinity Vault: Anything multiplied by 0 vanishes!`,
      slots,
      trayTiles: tiles,
      hintText: `Use the zero property or identity property to construct ${cfg.target}!`,
    });
  });

  return levels;
}
