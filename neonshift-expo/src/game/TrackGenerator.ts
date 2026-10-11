import { EnergyShard } from './CollectibleManager';
import { DifficultyTier } from './GameStatus';
import { GameConfig } from './GameConfig';
import { Obstacle, ObstacleType } from './Obstacle';
import { PowerUpPickup, PowerUpType } from './PowerUp';

export interface SpawnBatch {
  obstacles: Obstacle[];
  shards: EnergyShard[];
  powerUps: PowerUpPickup[];
}

/**
 * Procedural track generator. Guarantees every generated row is passable:
 * never blocks all lanes simultaneously, always leaves at least one clear lane,
 * and ensures collectibles are reachable.
 */
export class TrackGenerator {
  private idCounter = 0;

  constructor() {}

  private nextId(prefix: string): string {
    return `${prefix}-${this.idCounter++}`;
  }

  public generateRow(z: number, tier: DifficultyTier): SpawnBatch {
    const obstacles: Obstacle[] = [];
    const shards: EnergyShard[] = [];
    const powerUps: PowerUpPickup[] = [];

    const laneCount = GameConfig.LANE_COUNT;
    const blockedLanes = new Set<number>();

    let maxBlocked = 1;
    let obstacleChance = 0.5;

    switch (tier) {
      case DifficultyTier.GRID_ZERO:
        maxBlocked = 1;
        obstacleChance = 0.5;
        break;
      case DifficultyTier.CYBER_SHIFT:
        maxBlocked = 1;
        obstacleChance = 0.65;
        break;
      case DifficultyTier.HYPER_PULSE:
        maxBlocked = laneCount - 1; // 2
        obstacleChance = 0.8;
        break;
      case DifficultyTier.OVERDRIVE:
        maxBlocked = laneCount - 1; // 2
        obstacleChance = 0.85;
        break;
    }

    if (Math.random() < obstacleChance) {
      const blockCount = Math.floor(Math.random() * maxBlocked) + 1; // 1..maxBlocked
      // Shuffle lanes
      const allLanes = Array.from({ length: laneCount }, (_, i) => i);
      for (let i = allLanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allLanes[i], allLanes[j]] = [allLanes[j], allLanes[i]];
      }
      const lanesToBlock = allLanes.slice(0, blockCount);

      const availableTypes =
        tier === DifficultyTier.GRID_ZERO
          ? [ObstacleType.GROUND_BARRIER]
          : [ObstacleType.GROUND_BARRIER, ObstacleType.HORIZONTAL_LASER, ObstacleType.VOID_GAP];

      for (const lane of lanesToBlock) {
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        obstacles.push({
          id: this.nextId('obs'),
          type,
          z,
          lane,
        });
        blockedLanes.add(lane);
      }
    }

    // Collectibles: only placed in open, unblocked lanes
    const openLanes = Array.from({ length: laneCount }, (_, i) => i).filter(
      (l) => !blockedLanes.has(l)
    );

    if (openLanes.length > 0 && Math.random() < 0.6) {
      const lane = openLanes[Math.floor(Math.random() * openLanes.length)];
      shards.push({
        id: this.nextId('shard'),
        z,
        lane,
      });
    }

    // Power-ups: rare spawn in open lanes
    if (openLanes.length > 0 && Math.random() < 0.04) {
      const lane = openLanes[Math.floor(Math.random() * openLanes.length)];
      const powerUpTypes = Object.values(PowerUpType);
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      powerUps.push({
        id: this.nextId('pu'),
        type,
        z,
        lane,
      });
    }

    return { obstacles, shards, powerUps };
  }
}
