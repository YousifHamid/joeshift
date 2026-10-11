import { DifficultyTier, GameStatus } from './GameStatus';
import { GameConfig } from './GameConfig';
import { PowerUpType } from './PowerUp';
import { DEFAULT_SKIN_ID, SkinId } from './VehicleSkins';

export interface RenderObstacle {
  id: string;
  lane: number;
  z: number;
  type: string;
}

export interface RenderShard {
  id: string;
  lane: number;
  z: number;
}

export interface RenderPowerUp {
  id: string;
  lane: number;
  z: number;
  type: PowerUpType;
}

export interface RenderProjectile {
  id: string;
  lane: number;
  z: number;
}

export interface GameUiState {
  status: GameStatus;
  score: number;
  distanceMeters: number;
  comboMultiplier: number;
  speed: number;
  isGridShifting: boolean;
  gridShiftWarning: boolean;
  activePowerUps: PowerUpType[];
  activePowerUpTimers: Record<string, { remaining: number; total: number }>;
  playerLane: number;
  playerX: number;
  playerY: number;
  playerRoll: number;
  playerSquashY: number;
  playerSquashX: number;
  playerLandingShockwave: number;
  isJumping: boolean;
  tier: DifficultyTier;
  shardsCollected: number;
  nearMisses: number;
  maxCombo: number;
  isBoosting: boolean;
  gameOverCause: string | null;
  currentStage: number;
  stageTargetMeters: number;
  stageLengthMeters: number;
  stageProgressPct: number;
  stageCelebrationText: string | null;
  ammo: number;
  maxAmmo: number;
  equippedSkin: SkinId;
  headstartActive: boolean;
  introLaunchProgress: number;
  obstacleSnapshot: RenderObstacle[];
  shardSnapshot: RenderShard[];
  powerUpSnapshot: RenderPowerUp[];
  projectileSnapshot: RenderProjectile[];
}

export const defaultGameUiState: GameUiState = {
  status: GameStatus.MENU,
  score: 0,
  distanceMeters: 0,
  comboMultiplier: 1.0,
  speed: GameConfig.BASE_WORLD_SPEED,
  isGridShifting: false,
  gridShiftWarning: false,
  activePowerUps: [],
  activePowerUpTimers: {},
  playerLane: 1,
  playerX: 0,
  playerY: 0,
  playerRoll: 0,
  playerSquashY: 1.0,
  playerSquashX: 1.0,
  playerLandingShockwave: 0,
  isJumping: false,
  tier: DifficultyTier.GRID_ZERO,
  shardsCollected: 0,
  nearMisses: 0,
  maxCombo: 1.0,
  isBoosting: false,
  gameOverCause: null,
  currentStage: 1,
  stageTargetMeters: 1000,
  stageLengthMeters: 1000,
  stageProgressPct: 0,
  stageCelebrationText: null,
  ammo: 5,
  maxAmmo: 5,
  equippedSkin: DEFAULT_SKIN_ID,
  headstartActive: false,
  introLaunchProgress: 1.0,
  obstacleSnapshot: [],
  shardSnapshot: [],
  powerUpSnapshot: [],
  projectileSnapshot: [],
};

