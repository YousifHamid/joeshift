import { GameConfig } from './GameConfig';
import { DifficultyTier } from './GameStatus';

export class DifficultyManager {
  public static tierFor(distanceMeters: number): DifficultyTier {
    if (distanceMeters >= GameConfig.TIER_OVERDRIVE_M) {
      return DifficultyTier.OVERDRIVE;
    }
    if (distanceMeters >= GameConfig.TIER_HYPER_PULSE_M) {
      return DifficultyTier.HYPER_PULSE;
    }
    if (distanceMeters >= GameConfig.TIER_CYBER_SHIFT_M) {
      return DifficultyTier.CYBER_SHIFT;
    }
    return DifficultyTier.GRID_ZERO;
  }

  /**
   * World speed ramps smoothly with distance rather than jumping at tier boundaries.
   */
  public static speedFor(
    distanceMeters: number,
    chronoWarpActive: boolean,
    isBoosting: boolean = false
  ): number {
    const progress = Math.min(distanceMeters / GameConfig.TIER_OVERDRIVE_M, 1.6);
    let speed =
      GameConfig.BASE_WORLD_SPEED +
      (GameConfig.MAX_WORLD_SPEED - GameConfig.BASE_WORLD_SPEED) * Math.min(progress, 1);

    if (isBoosting) {
      speed *= GameConfig.BOOST_SPEED_MULTIPLIER;
    }

    return chronoWarpActive ? speed * GameConfig.CHRONO_WARP_SPEED_FACTOR : speed;
  }

  /**
   * Average seconds between obstacle spawns — shrinks (faster spawns) as the tier rises.
   */
  public static spawnIntervalFor(tier: DifficultyTier): number {
    switch (tier) {
      case DifficultyTier.GRID_ZERO:
        return 1.6;
      case DifficultyTier.CYBER_SHIFT:
        return 1.2;
      case DifficultyTier.HYPER_PULSE:
        return 0.9;
      case DifficultyTier.OVERDRIVE:
        return 0.65;
    }
  }

  /**
   * Average seconds between Grid Shift events — more frequent at higher tiers.
   */
  public static gridShiftIntervalFor(tier: DifficultyTier): number {
    switch (tier) {
      case DifficultyTier.GRID_ZERO:
        return Number.POSITIVE_INFINITY;
      case DifficultyTier.CYBER_SHIFT:
        return 14;
      case DifficultyTier.HYPER_PULSE:
        return 9;
      case DifficultyTier.OVERDRIVE:
        return 5;
    }
  }
}
