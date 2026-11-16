# Number Builder - Todo Checklist

## Phase 1: Workspace & Tooling Foundation
- [x] 1.1 Initialize Vite + React + TypeScript + Tailwind CSS project
- [x] 1.2 Stage the provided Number Builder logo and setup transparent alpha extraction
- [x] 1.3 Setup pastel-and-cream architectural theme colors and styles

## Phase 2: AST Math Evaluator & 100-Level Dataset
- [x] 2.1 Implement Shunting-Yard AST evaluator (`src/game/math/evaluator.ts`)
- [x] 2.2 Author 100-level pedagogical progression matrix (`src/game/levels/generateAllLevels.ts`, `src/game/levels/data.ts`)
- [x] 2.3 Write automated solver verification script to test 100% solvability (`src/game/levels/solver.ts`)

## Phase 3: Tactile Studio Audio Engine
- [x] 3.1 Implement Web Audio procedural synthesizer (`src/game/audio/soundEngine.ts`)
- [x] 3.2 Add Lo-fi Kalimba BGM loop, tactile clicks, magnetic snap, thud, and win fanfare
- [x] 3.3 Create audio controls (Music toggle, SFX toggle)

## Phase 4: Magnetic Tile & Slot Equation Board
- [x] 4.1 Build Tile component (acrylic/wooden 3D tactile bevels, locked vs movable states)
- [x] 4.2 Build Slot frame component with magnetic snap zones
- [x] 4.3 Implement dual interaction (tap-to-slot, drag-to-slot, tap-to-return, slot-swap)
- [x] 4.4 Add gentle error shake and hint lightbulb logic

## Phase 5: Complete Screen Flow & Progression Map
- [x] 5.1 Screen 1: Home Screen with floating geometric polygons, logo, audio toggles
- [x] 5.2 Screen 2: 100-Level Chapter Grid (10 Worlds x 10 Levels) with localStorage progress
- [x] 5.3 Screen 3: Gameplay Board with Target Card, Equation Frame, and Tile Bank
- [x] 5.4 Screen 4: Celebration Screen with golden glow, geometric confetti, star reveals

## Phase 6: Verification & Testing
- [x] 6.1 Execute Vitest test suite for math evaluator and solver (6/6 tests passing)
- [x] 6.2 Verify production build (`npm run build` succeeds)
