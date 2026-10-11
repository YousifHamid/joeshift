import { GameConfig } from './GameConfig';
import { Player } from './Player';

export interface EnergyShard {
  id: string;
  z: number;
  lane: number;
  collected?: boolean;
}

export class CollectibleManager {
  private _active: EnergyShard[] = [];

  public get active(): readonly EnergyShard[] {
    return this._active;
  }

  public spawn(shard: EnergyShard): void {
    this._active.push(shard);
  }

  public update(worldSpeed: number, dt: number): void {
    for (let i = this._active.length - 1; i >= 0; i--) {
      const s = this._active[i];
      s.z -= worldSpeed * dt;
      if (s.z < GameConfig.DESPAWN_Z) {
        this._active.splice(i, 1);
      }
    }
  }

  /**
   * Checks pickup range, optionally widened by an active Energy Magnet radius.
   * Also pulls shards towards the player when magnet is active!
   */
  public collectInRange(player: Player, magnetActive: boolean, dt: number = 0.016): EnergyShard[] {
    const radius = magnetActive
      ? GameConfig.MAGNET_RADIUS
      : GameConfig.OBSTACLE_HITBOX_RADIUS + GameConfig.PLAYER_HITBOX_RADIUS;

    const collected: EnergyShard[] = [];

    const playerFrontZ = GameConfig.PLAYER_Z + GameConfig.PLAYER_HITBOX_FRONT;
    const playerRearZ = GameConfig.PLAYER_Z - GameConfig.PLAYER_HITBOX_REAR;

    for (let i = this._active.length - 1; i >= 0; i--) {
      const s = this._active[i];

      // If magnet is active and within magnet range, pull shard towards player
      if (magnetActive) {
        const zDistToCenter = Math.abs(s.z - GameConfig.PLAYER_Z);
        if (zDistToCenter <= GameConfig.MAGNET_RADIUS * 1.5) {
          const shardX = player.laneCenterX(s.lane);
          const diffX = player.x - shardX;
          if (Math.abs(diffX) > 0.05 && Math.abs(diffX) < 1.0) {
            s.lane = player.lane;
          }
        }
      }

      // Check Z overlap: triggers the exact moment shard reaches the vehicle nose
      const inZ = magnetActive
        ? Math.abs(s.z - GameConfig.PLAYER_Z) <= GameConfig.MAGNET_RADIUS
        : s.z <= playerFrontZ && s.z >= playerRearZ - 0.5;

      if (!inZ) continue;

      const shardX = player.laneCenterX(s.lane);
      const xDist = Math.abs(shardX - player.x);
      const xThreshold = magnetActive
        ? GameConfig.MAGNET_RADIUS
        : GameConfig.PLAYER_HITBOX_RADIUS + GameConfig.OBSTACLE_HITBOX_RADIUS;

      if (xDist <= xThreshold) {
        s.collected = true;
        collected.push(s);
        this._active.splice(i, 1);
      }
    }

    return collected;
  }

  public reset(): void {
    this._active = [];
  }
}
