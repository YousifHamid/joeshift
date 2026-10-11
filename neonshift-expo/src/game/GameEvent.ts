import { PowerUpType } from './PowerUp';

export type GameEvent =
  | { type: 'LaneChanged'; fromLane: number; toLane: number }
  | { type: 'Jumped' }
  | { type: 'Landed' }
  | { type: 'Collected'; shardId: string }
  | { type: 'PowerUpActivated'; powerUpType: PowerUpType }
  | { type: 'PowerUpExpired'; powerUpType: PowerUpType }
  | { type: 'NearMiss'; obstacleId: string }
  | { type: 'GridShiftWarning' }
  | { type: 'GridShiftStarted' }
  | { type: 'GridShiftEnded' }
  | { type: 'ShieldConsumed' }
  | { type: 'Collision'; cause: string }
  | { type: 'GameOver' }
  | { type: 'NewHighScore'; score: number }
  | { type: 'BoostStarted' }
  | { type: 'BoostEnded' }
  | { type: 'BlasterFired' }
  | { type: 'ObstacleBlasted'; obstacleId: string }
  | { type: 'StageCleared'; stage: number; targetMeters?: number; nextStage?: number };
