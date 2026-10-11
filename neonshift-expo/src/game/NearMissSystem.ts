import { CollisionResult, CollisionSystem } from './CollisionSystem';
import { GameConfig } from './GameConfig';
import { Obstacle } from './Obstacle';
import { Player } from './Player';

export class NearMissSystem {
  /**
   * Returns the obstacles that qualify as a near miss this frame:
   * player passed within NEAR_MISS_RADIUS without colliding.
   * Marks obstacles so each pays out exactly once.
   */
  public static collectNewNearMisses(player: Player, obstacles: readonly Obstacle[]): Obstacle[] {
    const results: Obstacle[] = [];

    const playerFrontZ = GameConfig.PLAYER_Z + GameConfig.PLAYER_HITBOX_FRONT;
    const playerRearZ = GameConfig.PLAYER_Z - GameConfig.PLAYER_HITBOX_REAR;

    for (const o of obstacles) {
      if (o.nearMissEvaluated) continue;

      const inZ = o.z <= playerFrontZ + 0.5 && o.z >= playerRearZ - 0.5;
      if (!inZ) {
        // Mark evaluated once obstacle is safely behind player
        if (o.z < playerRearZ - 1.0) {
          o.nearMissEvaluated = true;
        }
        continue;
      }

      const obstacleX = player.laneCenterX(o.lane);
      const xDist = Math.abs(obstacleX - player.x);
      const isColliding = CollisionSystem.evaluate(player, o) !== CollisionResult.NONE;

      if (!isColliding && xDist <= GameConfig.NEAR_MISS_RADIUS) {
        o.nearMissEvaluated = true;
        results.push(o);
      }
    }

    return results;
  }
}
