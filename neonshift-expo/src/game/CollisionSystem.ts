import { GameConfig } from './GameConfig';
import { Obstacle, ObstacleType } from './Obstacle';
import { Player } from './Player';

export enum CollisionResult {
  NONE = 'NONE',
  HAZARD_HIT = 'HAZARD_HIT',
  VOID_FALL = 'VOID_FALL',
}

export class CollisionSystem {
  /**
   * True if player's continuous X is within hitbox radius of obstacle lane center,
   * and obstacle Z is within collision range of player fixed Z.
   */
  public static sameLaneAndInRange(player: Player, obstacle: Obstacle): boolean {
    // 3D Bounding Box overlap in Z:
    // Obstacle front face is at obstacle.z, rear is at obstacle.z + 1.3
    // Player front nose is at PLAYER_Z + PLAYER_HITBOX_FRONT, rear is at PLAYER_Z - PLAYER_HITBOX_REAR
    const obstacleFrontZ = obstacle.z;
    const obstacleRearZ = obstacle.z + 1.3;
    const playerFrontZ = GameConfig.PLAYER_Z + GameConfig.PLAYER_HITBOX_FRONT;
    const playerRearZ = GameConfig.PLAYER_Z - GameConfig.PLAYER_HITBOX_REAR;

    // Overlap in Z interval: obstacle front has reached player front, and obstacle rear hasn't passed player rear
    const inZ = obstacleFrontZ <= playerFrontZ && obstacleRearZ >= playerRearZ;
    if (!inZ) return false;

    // Lateral X overlap: check if player and obstacle lanes/centers overlap
    const obstacleX = player.laneCenterX(obstacle.lane);
    const xDist = Math.abs(obstacleX - player.x);
    const xThreshold = GameConfig.PLAYER_HITBOX_RADIUS + GameConfig.OBSTACLE_HITBOX_RADIUS;
    return xDist <= xThreshold;
  }

  /**
   * Evaluate a single obstacle against player physical state.
   */
  public static evaluate(player: Player, obstacle: Obstacle): CollisionResult {
    if (!this.sameLaneAndInRange(player, obstacle)) {
      return CollisionResult.NONE;
    }

    switch (obstacle.type) {
      case ObstacleType.VOID_GAP:
        return player.isAirborne ? CollisionResult.NONE : CollisionResult.VOID_FALL;
      case ObstacleType.GROUND_BARRIER:
      case ObstacleType.HORIZONTAL_LASER:
        return player.isAirborne ? CollisionResult.NONE : CollisionResult.HAZARD_HIT;
    }
  }

  public static evaluateAll(
    player: Player,
    obstacles: readonly Obstacle[]
  ): { obstacle: Obstacle; result: CollisionResult } | null {
    for (const o of obstacles) {
      const result = this.evaluate(player, o);
      if (result !== CollisionResult.NONE) {
        return { obstacle: o, result };
      }
    }
    return null;
  }
}
