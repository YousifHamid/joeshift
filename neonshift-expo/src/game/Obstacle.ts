export enum ObstacleType {
  GROUND_BARRIER = 'GROUND_BARRIER',
  HORIZONTAL_LASER = 'HORIZONTAL_LASER',
  VOID_GAP = 'VOID_GAP',
}

export interface ObstacleTypeConfig {
  requiresJumpToAvoid: boolean;
  requiresAirborneToCross: boolean;
  displayName: string;
}

export const ObstacleConfigs: Record<ObstacleType, ObstacleTypeConfig> = {
  [ObstacleType.GROUND_BARRIER]: {
    requiresJumpToAvoid: true,
    requiresAirborneToCross: false,
    displayName: 'GROUND BARRIER',
  },
  [ObstacleType.HORIZONTAL_LASER]: {
    requiresJumpToAvoid: true,
    requiresAirborneToCross: false,
    displayName: 'HORIZONTAL LASER',
  },
  [ObstacleType.VOID_GAP]: {
    requiresJumpToAvoid: false,
    requiresAirborneToCross: true,
    displayName: 'VOID GAP',
  },
};

export interface Obstacle {
  id: string;
  type: ObstacleType;
  z: number;
  lane: number;
  nearMissEvaluated?: boolean;
  passed?: boolean;
}
