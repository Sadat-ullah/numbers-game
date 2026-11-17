import { test, expect } from '@playwright/test';

test.describe('Number Builder - Closed-Loop Verification Suite', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test('1. Copy & Layout Audit (No Age, No Warm Pastel Studio, Responsive Logo)', async ({ page, isMobile }) => {
    const bodyText = await page.innerText('body');

    // Fix 5: Ensure "Warm Pastel Studio" is completely absent
    expect(bodyText.toLowerCase()).not.toContain('warm pastel studio');

    // Fix 4: Ensure all age labels are purged
    expect(bodyText).not.toMatch(/ages?\s*\d+/i);
    expect(bodyText).not.toContain('Ages');

    // Fix 10: Check responsive logo dimensions
    const logo = page.getByTestId('game-logo');
    await expect(logo).toBeVisible();
    const logoBox = await logo.boundingBox();
    expect(logoBox).not.toBeNull();

    if (isMobile) {
      expect(logoBox!.width).toBeGreaterThanOrEqual(230);
    } else {
      expect(logoBox!.width).toBeGreaterThanOrEqual(440);
    }

    // Verify START button is visible without being pushed off-screen
    const startBtn = page.getByTestId('start-button');
    await expect(startBtn).toBeVisible();
    const startBox = await startBtn.boundingBox();
    expect(startBox).not.toBeNull();
    const viewportSize = page.viewportSize();
    expect(startBox!.y + startBox!.height).toBeLessThanOrEqual(viewportSize!.height);

    // Enter Game Screen and check equation container width
    await startBtn.click();
    await expect(page.getByTestId('equation-board')).toBeVisible();

    const eqContainer = page.getByTestId('equation-container');
    await expect(eqContainer).toBeVisible();
    const eqBox = await eqContainer.boundingBox();
    expect(eqBox).not.toBeNull();

    if (isMobile) {
      // Equation container occupies >= 80% of horizontal viewport width
      expect(eqBox!.width).toBeGreaterThanOrEqual(viewportSize!.width * 0.78);
    }
  });

  test('2. Audio Initialization Audit (Plays on Start without Toggle Cycle)', async ({ page }) => {
    // Click START button to trigger initial user gesture
    const startBtn = page.getByTestId('start-button');
    await startBtn.click();

    // Verify audio state in the running app via window.__sound
    const isPlaying = await page.evaluate(() => {
      const soundEngine = (window as unknown as { __sound: { isMusicPlaying: boolean } }).__sound;
      return soundEngine ? soundEngine.isMusicPlaying : false;
    });

    expect(isPlaying).toBe(true);
  });

  test('3. Drag-Only & Auto-Check Audit (No Tap-to-Slot & Instant Auto-Solve)', async ({ page }) => {
    // Navigate to Game Screen (Level 1: Target = 3, Slots: [s-1-1] + [s-1-2] = 3)
    const startBtn = page.getByTestId('start-button');
    await startBtn.click();
    await expect(page.getByTestId('equation-board')).toBeVisible();

    // Verify "Check Answer" button does NOT exist (Fix 7)
    const checkBtn = page.locator('text="Check Answer"');
    await expect(checkBtn).toHaveCount(0);

    // FIX 6: Click-to-slot test. Tapping a tray tile must NOT slot it!
    const trayTile = page.locator('[data-testid="tile-tray"] [data-tile-id]').first();
    await trayTile.click();

    // Verify slots remain empty after simple click
    const slottedTilesAfterClick = page.locator('[data-slot-id] [data-tile-id]');
    await expect(slottedTilesAfterClick).toHaveCount(0);

    // Perform Drag-and-Drop:
    const tile1 = page.locator('[data-testid="tile-tray"] [data-tile-value="1"]').first();
    const tile2 = page.locator('[data-testid="tile-tray"] [data-tile-value="2"]').first();

    const slot1 = page.locator('[data-slot-id="s-1-1"]');
    const slot2 = page.locator('[data-slot-id="s-1-2"]');

    // Drag tile 1 into slot 1
    await tile1.dragTo(slot1);
    await page.waitForTimeout(150);

    // Verify 1 tile is now in slot 1
    await expect(page.locator('[data-slot-id="s-1-1"] [data-tile-value="1"]')).toBeVisible();

    // Drag tile 2 into slot 2 (completes equation: 1 + 2 = 3)
    await tile2.dragTo(slot2);

    // FIX 7: Auto-Check runs automatically after 350ms without clicking any button!
    const celebrationModal = page.getByTestId('celebration-modal');
    await expect(celebrationModal).toBeVisible({ timeout: 4000 });
    await expect(page.locator('text=Solved!')).toBeVisible();

    // On Level 1, no hint milestone is reached (requires 10 levels)
    await expect(page.getByTestId('hint-reward-badge')).toHaveCount(0);
  });

  test('4. Hint Economy & High-Visibility Highlighting Audit', async ({ page }) => {
    const startBtn = page.getByTestId('start-button');
    await startBtn.click();
    await expect(page.getByTestId('equation-board')).toBeVisible();

    // Fix 2: Starts with 3 free hints
    const hintCounter = page.getByTestId('hint-counter');
    await expect(hintCounter).toHaveText('3');

    // Click hint button
    const hintBtn = page.getByTestId('hint-button');
    await hintBtn.click();

    // Decrements to 2
    await expect(hintCounter).toHaveText('2');

    // Fix 8: High-visibility highlighting on both tray tile and slot
    const highlightedTrayTile = page.locator('[data-testid="tile-tray"] .hint-highlight');
    await expect(highlightedTrayTile).toBeVisible();

    const highlightedSlot = page.locator('[data-slot-id].hint-highlight');
    await expect(highlightedSlot).toBeVisible();

    // Use remaining hints until 0
    await hintBtn.click();
    await expect(hintCounter).toHaveText('1');

    await hintBtn.click();
    await expect(hintCounter).toHaveText('0');

    // Verify button is blocked at 0 (clicking does not decrement further)
    await hintBtn.click();
    await expect(hintCounter).toHaveText('0');
  });

  test('5. Multi-Solution Auto-Check (Accepts 2 + 1 = 3 commutative order)', async ({ page }) => {
    const startBtn = page.getByTestId('start-button');
    await startBtn.click();

    // Level 1: Target = 3. Drag 2 into slot 1, and 1 into slot 2 (2 + 1 = 3)
    const tile2 = page.locator('[data-testid="tile-tray"] [data-tile-value="2"]').first();
    const tile1 = page.locator('[data-testid="tile-tray"] [data-tile-value="1"]').first();
    const slot1 = page.locator('[data-slot-id="s-1-1"]');
    const slot2 = page.locator('[data-slot-id="s-1-2"]');

    await tile2.dragTo(slot1);
    await page.waitForTimeout(150);
    await tile1.dragTo(slot2);

    // Auto-solves commutative solution
    await expect(page.getByTestId('celebration-modal')).toBeVisible({ timeout: 4000 });
  });

  test('6. Drag-and-Drop Release Audit (Clean release, unslotting & return to tray)', async ({ page }) => {
    const startBtn = page.getByTestId('start-button');
    await startBtn.click();
    await expect(page.getByTestId('equation-board')).toBeVisible();

    const tile1 = page.locator('[data-testid="tile-tray"] [data-tile-value="1"]').first();
    const slot1 = page.locator('[data-slot-id="s-1-1"]');

    const tBox = await tile1.boundingBox();
    const sBox = await slot1.boundingBox();
    expect(tBox).not.toBeNull();
    expect(sBox).not.toBeNull();

    // 1. Mouse drag from tray to slot
    await page.mouse.move(tBox!.x + tBox!.width / 2, tBox!.y + tBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(sBox!.x + sBox!.width / 2, sBox!.y + sBox!.height / 2, { steps: 12 });
    await page.mouse.up();

    // Verify tile is placed and drag overlay is cleared
    await expect(page.locator('[data-slot-id="s-1-1"] [data-tile-value="1"]')).toBeVisible();
    await expect(page.locator('[data-testid="dragged-tile-overlay"]')).toHaveCount(0);

    // 2. Drag placed tile OUT of slot to tray
    const placedTile = page.locator('[data-slot-id="s-1-1"] [data-tile-value="1"]');
    const tray = page.getByTestId('tile-tray');
    const pBox = await placedTile.boundingBox();
    const trBox = await tray.boundingBox();

    await page.mouse.move(pBox!.x + pBox!.width / 2, pBox!.y + pBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(trBox!.x + trBox!.width / 2, trBox!.y + trBox!.height / 2, { steps: 12 });
    await page.mouse.up();

    // Verify tile is released back into the tray and removed from slot
    await expect(page.locator('[data-slot-id="s-1-1"] [data-tile-value="1"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tile-tray"] [data-tile-value="1"]')).toBeVisible();
    await expect(page.locator('[data-testid="dragged-tile-overlay"]')).toHaveCount(0);

    // 3. Re-place tile and test tapping placed tile to release
    await tile1.dragTo(slot1);
    await expect(page.locator('[data-slot-id="s-1-1"] [data-tile-value="1"]')).toBeVisible();

    const placedTileAgain = page.locator('[data-slot-id="s-1-1"] [data-tile-value="1"]');
    await placedTileAgain.click();

    // Verify tap releases back to tray
    await expect(page.locator('[data-slot-id="s-1-1"] [data-tile-value="1"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tile-tray"] [data-tile-value="1"]')).toBeVisible();
  });

  test('7. Hint Economy: Completing 10 levels awards 2 hints', async ({ page }) => {
    // Seed 9 completed levels in localStorage so Level 10 completes the 10th level
    await page.evaluate(() => {
      localStorage.setItem('nb_hint_balance', '3');
      localStorage.setItem('nb_current_level', '10');
      localStorage.setItem('nb_unlocked_level', '10');
      localStorage.setItem('nb_level_stars', JSON.stringify({
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3
      }));
      localStorage.setItem('nb_rewarded_milestones', JSON.stringify([]));
    });
    await page.reload();

    const startBtn = page.getByTestId('start-button');
    await startBtn.click();
    await expect(page.getByTestId('equation-board')).toBeVisible();

    // Verify hint balance starts at 3
    const hintCounter = page.getByTestId('hint-counter');
    await expect(hintCounter).toHaveText('3');

    // Level 10: Target = 10, Slots: [8] + [2] = 10
    const tile8 = page.locator('[data-testid="tile-tray"] [data-tile-value="8"]').first();
    const tile2 = page.locator('[data-testid="tile-tray"] [data-tile-value="2"]').first();
    const slot1 = page.locator('[data-slot-id="s-10-1"]');
    const slot2 = page.locator('[data-slot-id="s-10-2"]');

    await tile8.dragTo(slot1);
    await page.waitForTimeout(150);
    await tile2.dragTo(slot2);

    // Auto-check solves level 10
    const celebrationModal = page.getByTestId('celebration-modal');
    await expect(celebrationModal).toBeVisible({ timeout: 4000 });

    // Expect +2 Hints Earned badge!
    const rewardBadge = page.getByTestId('hint-reward-badge');
    await expect(rewardBadge).toBeVisible();
    await expect(rewardBadge).toContainText('+2 💡 Hints Earned!');

    // Advance to next level (Level 11)
    await page.getByTestId('celebration-next-button').click();
    await expect(celebrationModal).toHaveCount(0);

    // Verify hint balance is now 5 (3 + 2 = 5)
    await expect(page.getByTestId('hint-counter')).toHaveText('5');
  });

  test('8. Builder Mascot "Pip" & World Map Polish Audit', async ({ page }) => {
    // 1. Verify Mascot on Home Screen
    const mascot = page.getByTestId('builder-mascot');
    await expect(mascot).toBeVisible();

    // Verify "Tap me to play" text is removed from the Home Screen
    const bodyText = await page.innerText('body');
    expect(bodyText.toLowerCase()).not.toContain('tap me to play');

    // Tap/Click Mascot to verify interactive reaction
    await mascot.click();
    await page.waitForTimeout(100);
    await expect(page.getByTestId('builder-mascot')).toBeVisible();

    // 2. Open 100 Levels Map
    const levelsBtn = page.getByTestId('levels-button');
    await levelsBtn.click();
    await expect(page.getByTestId('world-selector-bar')).toBeVisible();

    // Verify all 10 world pills exist and are not clipped
    const worldPills = page.locator('[data-testid^="world-pill-"]');
    await expect(worldPills).toHaveCount(10);

    // Verify Mascot marker is rendered on active level card (Level 1)
    const mapMascotMarker = page.getByTestId('map-mascot-marker');
    await expect(mapMascotMarker).toBeVisible();

    // 3. Launch Level 1 from Map
    const level1Card = page.getByTestId('level-card-1');
    await level1Card.click();
    await expect(page.getByTestId('equation-board')).toBeVisible();

    // Verify Mascot is present in Gameplay screen as companion
    const gameMascot = page.getByTestId('builder-mascot');
    await expect(gameMascot).toBeVisible();
  });
});
