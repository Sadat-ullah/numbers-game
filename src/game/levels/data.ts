import { buildAllLevels, LevelData, WORLD_METADATA } from './generateAllLevels';

export const ALL_LEVELS: LevelData[] = buildAllLevels();
export { WORLD_METADATA };
export type { LevelData };
