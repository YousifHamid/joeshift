import { GameConfig } from './GameConfig';
import { Obstacle } from './Obstacle';

export class ObstacleManager {
  private _active: Obstacle[] = [];

  public get active(): readonly Obstacle[] {
    return this._active;
  }

  public spawn(obstacle: Obstacle): void {
    this._active.push(obstacle);
  }

  public update(worldSpeed: number, dt: number): void {
    for (let i = this._active.length - 1; i >= 0; i--) {
      const o = this._active[i];
      o.z -= worldSpeed * dt;
      if (o.z < GameConfig.DESPAWN_Z) {
        this._active.splice(i, 1);
      }
    }
  }

  public remove(obstacle: Obstacle): void {
    const idx = this._active.findIndex((o) => o.id === obstacle.id);
    if (idx !== -1) {
      this._active.splice(idx, 1);
    }
  }

  public removeById(id: string): boolean {
    const idx = this._active.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this._active.splice(idx, 1);
      return true;
    }
    return false;
  }

  public clearNearby(minZ: number, maxZ: number): void {
    this._active = this._active.filter((o) => o.z < minZ || o.z > maxZ);
  }

  public reset(): void {
    this._active = [];
  }
}
