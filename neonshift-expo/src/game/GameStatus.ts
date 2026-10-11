export enum GameStatus {
  MENU = 'MENU',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum DifficultyTier {
  GRID_ZERO = 'GRID_ZERO',
  CYBER_SHIFT = 'CYBER_SHIFT',
  HYPER_PULSE = 'HYPER_PULSE',
  OVERDRIVE = 'OVERDRIVE',
}

export const DifficultyTierLabels: Record<DifficultyTier, string> = {
  [DifficultyTier.GRID_ZERO]: 'GRID ZERO',
  [DifficultyTier.CYBER_SHIFT]: 'CYBER SHIFT',
  [DifficultyTier.HYPER_PULSE]: 'HYPER PULSE',
  [DifficultyTier.OVERDRIVE]: 'OVERDRIVE',
};
