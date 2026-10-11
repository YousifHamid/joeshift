import { GameConfig } from './GameConfig';

export class Player {
  public lane: number = 1;
  public x: number = 0;
  public startX: number = 0;
  public targetLane: number = 1;
  public laneChangeElapsed: number = GameConfig.LANE_CHANGE_DURATION_S;
  public y: number = GameConfig.GROUND_Y;
  public verticalVelocity: number = 0;
  public isAirborne: boolean = false;

  // Visual juicy game-feel properties
  public rollAngle: number = 0; // -1 (left tilt) to +1 (right tilt)
  public squashY: number = 1.0;
  public squashX: number = 1.0;
  public landingShockwave: number = 0; // 0..1 timer for expanding ground ring

  constructor() {
    this.reset();
  }

  public laneCenterX(lane: number): number {
    return (lane - (GameConfig.LANE_COUNT - 1) / 2) * GameConfig.LANE_WIDTH;
  }

  public startLaneChange(newLane: number): void {
    const clamped = Math.max(0, Math.min(newLane, GameConfig.LANE_COUNT - 1));
    if (clamped === this.targetLane) return;
    this.startX = this.x; // Seamless transition from wherever the ship currently is
    this.targetLane = clamped;
    this.laneChangeElapsed = 0;
  }

  public jump(): void {
    if (!this.isAirborne) {
      this.isAirborne = true;
      this.verticalVelocity = GameConfig.JUMP_VELOCITY;
      // Launch stretch
      this.squashY = 1.25;
      this.squashX = 0.85;
    }
  }

  public reset(): void {
    this.lane = 1;
    this.targetLane = 1;
    this.x = this.laneCenterX(1);
    this.startX = this.x;
    this.laneChangeElapsed = GameConfig.LANE_CHANGE_DURATION_S;
    this.y = GameConfig.GROUND_Y;
    this.verticalVelocity = 0;
    this.isAirborne = false;
    this.rollAngle = 0;
    this.squashY = 1.0;
    this.squashX = 1.0;
    this.landingShockwave = 0;
  }
}
