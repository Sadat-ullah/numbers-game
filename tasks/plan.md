# Implementation Plan: Number Builder

## Overview
Number Builder is a tactile geometric equation-construction puzzle game for children aged 3–12. It features a warm pastel-and-cream architectural studio aesthetic, wooden/acrylic magnetic tiles, crisp mechanical clicks, and a calm lo-fi kalimba soundtrack.

## Technical Architecture
- **Framework & Bundler:** Vite + React 19 / 18 + TypeScript
- **Styling:** Tailwind CSS + Custom CSS 3D/Neumorphic & tactile geometric styles
- **State Management:** React hooks + Persistent progress in `localStorage`
- **Math Engine:** Shunting-Yard AST Expression Evaluator with full BODMAS support, commutative equation permutation acceptance, and solvability proofing
- **Audio Engine:** High-fidelity Procedural Web Audio API synthesizer (Kalimba melodic loop, wooden click, magnetic snap, soft thud, celebratory fanfare) with zero external network dependencies and mute/volume toggles
- **Interactions:** Dual-mode input (Instant tap-to-slot and smooth pointer drag-and-drop with magnetic snap and slot swap/return)
- **100-Level Engine:** Full 10-World x 10-Level progression according to the Age 3–12 pedagogical matrix

---

## Phases & Tasks

### Phase 1: Workspace & Tooling Foundation
- [ ] Initialize Vite + React + TypeScript workspace with Tailwind CSS
- [ ] Configure asset paths, fonts, and responsive layout shell
- [ ] Stage logo (`public/assets/logo_number_builder.png`) and visual theme tokens

### Phase 2: AST Math Evaluator & 100-Level Pedagogical Dataset
- [ ] Implement Shunting-Yard AST math parser and expression evaluator
- [ ] Support flexible tile permutations (commutative addition/multiplication, strict division/subtraction operand validation)
- [ ] Generate all 100 levels across 10 worlds matching the exact age tiers (3–12)
- [ ] Add mathematical solver verification script to ensure >= 1 valid solution per level with zero unsolvable levels

### Phase 3: Tactile Studio Audio System
- [ ] Build Web Audio API procedural synthesizer for tactile soundscapes:
  - Lo-fi ambient kalimba chord progression background music
  - Wooden tile pickup click
  - Crisp magnetic slot snap
  - Soft error thud (invalid shake)
  - Golden chord victory fanfare
- [ ] Provide global audio manager with independent Music & SFX mute controls

### Phase 4: Magnetic Tile & Slot Equation Board
- [ ] Build equation slot frame with support for empty slots, locked anchor tiles, and operators
- [ ] Implement dual-input interaction:
  - Single-tap to auto-slot into first available blank
  - Drag-and-drop with magnetic proximity snapping
  - Tap slotted tile to return it to tray
- [ ] Implement slot swap and out-of-bounds drag auto-return
- [ ] Add tactile invalid equation shake and visual feedback

### Phase 5: Complete Screen Flow & Progression Map
- [ ] Screen 1: Home Screen with floating geometric polygons, logo, Start button, and audio controls
- [ ] Screen 2: 100-Level Chapter Grid (10 Worlds x 10 Levels) with sequential unlock, star ratings, and chapter badges
- [ ] Screen 3: Active Equation Board with Target card, hint lightbulb, equation frame, and tile tray
- [ ] Screen 4: Celebration Screen with golden glow, geometric confetti, star reveals, and Next Level auto-advance

### Phase 6: Automated Verification & Testing
- [ ] Unit tests for AST math engine and equation validation
- [ ] Solver bot test verifying all 100 levels can be completed
- [ ] Build verification (`npm run build`)
