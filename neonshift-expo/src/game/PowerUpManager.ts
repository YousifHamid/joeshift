import { GameConfig } from './GameConfig';
import { Player } from './Player';
import { ActivePowerUp, PowerUpPickup, PowerUpType } from './PowerUp';

export class PowerUpManager {
  private _pickups: PowerUpPickup[] = [];
  private _active: Map<PowerUpType, ActivePowerUp> = new Map();

  public get pickups(): readonly PowerUpPickup[] {
    return this._pickups;
  }

  public get active(): ReadonlyMap<PowerUpType, ActivePowerUp> {
    return this._active;
  }

  public spawn(pickup: PowerUpPickup): void {
    this._pickups.push(pickup);
  }

  public updatePickups(worldSpeed: number, dt: number): void {
    for (let i = this._pickups.length - 1; i >= 0; i--) {
      const p = this._pickups[i];
      p.z -= worldSpeed * dt;
      if (p.z < GameConfig.DESPAWN_Z) {
        this._pickups.splice(i, 1);
      }
    }
  }

  /**
   * Ticks all active effect durations down, expiring any that hit zero.
   * Returns the array of types that expired this frame.
   */
  public tickActive(dt: number): PowerUpType[] {
    const expired: PowerUpType[] = [];

    for (const [type, effect] of this._active.entries()) {
      effect.remainingSeconds -= dt;
      if (effect.remainingSeconds <= 0) {
        expired.push(type);
        this._active.delete(type);
      }
    }

    return expired;
  }

  public activate(type: PowerUpType): void {
    let duration: number;
    switch (type) {
      case PowerUpType.PHASE_SHIELD:
        duration = GameConfig.PHASE_SHIELD_DURATION_S;
        break;
      case PowerUpType.CHRONO_WARP:
        duration = GameConfig.CHRONO_WARP_DURATION_S;
        break;
      case PowerUpType.OVERDRIVE:
        duration = GameConfig.OVERDRIVE_DURATION_S;
        break;
      case PowerUpType.ENERGY_MAGNET:
        duration = GameConfig.MAGNET_DURATION_S;
        break;
    }

    this._active.set(type, {
      type,
      remainingSeconds: duration,
      totalDuration: duration,
    });
  }

  /**
   * Consumes (removes) the Phase Shield if active. Returns true if one was consumed.
   */
  public consumeShield(): boolean {
    if (this._active.has(PowerUpType.PHASE_SHIELD)) {
      this._active.delete(PowerUpType.PHASE_SHIELD);
      return true;
    }
    return false;
  }

  public isActive(type: PowerUpType): boolean {
    return this._active.has(type);
  }

  public checkPickups(player: Player): PowerUpPickup[] {
    const playerFrontZ = GameConfig.PLAYER_Z + GameConfig.PLAYER_HITBOX_FRONT;
    const playerRearZ = GameConfig.PLAYER_Z - GameConfig.PLAYER_HITBOX_REAR;
    const xThreshold = GameConfig.PLAYER_HITBOX_RADIUS + GameConfig.OBSTACLE_HITBOX_RADIUS;
    const collected: PowerUpPickup[] = [];

    for (let i = this._pickups.length - 1; i >= 0; i--) {
      const p = this._pickups[i];
      const inZ = p.z <= playerFrontZ && p.z >= playerRearZ - 0.5;
      if (!inZ) continue;

      const px = player.laneCenterX(p.lane);
      if (Math.abs(px - player.x) <= xThreshold) {
        p.collected = true;
        collected.push(p);
        this._pickups.splice(i, 1);
      }
    }

    return collected;
  }

  public reset(): void {
    this._pickups = [];
    this._active.clear();
  }
}
