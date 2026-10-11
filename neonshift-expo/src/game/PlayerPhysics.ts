import { GameConfig } from './GameConfig';
import { Player } from './Player';

export class PlayerPhysics {
  /**
   * Vertical jump/gravity integration with apex float and landing squash.
   * Returns true if the player just landed this frame.
   */
  public static updateVertical(player: Player, dt: number): boolean {
    // Tick landing shockwave if active
    if (player.landingShockwave > 0) {
      player.landingShockwave = Math.max(0, player.landingShockwave - dt * 2.5);
    }

    // Spring squash & stretch back to 1.0 smoothly
    player.squashY += (1.0 - player.squashY) * Math.min(1, dt * 14);
    player.squashX += (1.0 - player.squashX) * Math.min(1, dt * 14);

    if (!player.isAirborne) return false;

    // Apex float: reduce gravity slightly at the apex of the jump for a satisfying floaty feel
    const isNearApex = Math.abs(player.verticalVelocity) < 3.2;
    const gravityMultiplier = isNearApex ? 0.72 : (player.verticalVelocity < 0 ? 1.05 : 0.95);

    player.verticalVelocity += GameConfig.GRAVITY * gravityMultiplier * dt;
    player.y += player.verticalVelocity * dt;

    if (player.y <= GameConfig.GROUND_Y) {
      player.y = GameConfig.GROUND_Y;
      player.verticalVelocity = 0;
      player.isAirborne = false;
      // Landing squash impact
      player.squashY = 0.72;
      player.squashX = 1.32;
      player.landingShockwave = 1.0;
      return true;
    }
    return false;
  }

  /**
   * Horizontal lane-tween starting from continuous current X with dynamic roll banking.
   */
  public static updateHorizontal(player: Player, dt: number): void {
    const targetX = player.laneCenterX(player.targetLane);

    if (player.laneChangeElapsed >= GameConfig.LANE_CHANGE_DURATION_S) {
      player.x = targetX;
      player.lane = player.targetLane;
      // Gradually relax roll back to center
      player.rollAngle += (0 - player.rollAngle) * Math.min(1, dt * 14);
      return;
    }

    player.laneChangeElapsed += dt;
    const t = Math.min(1, player.laneChangeElapsed / GameConfig.LANE_CHANGE_DURATION_S);

    // Hermite smoothstep for natural cyber deceleration
    const smooth = t * t * (3 - 2 * t);
    const prevX = player.x;
    player.x = player.startX + (targetX - player.startX) * smooth;

    // Responsive banking tilt based on lateral displacement
    const dx = player.x - prevX;
    const targetRoll = Math.max(-1, Math.min(1, (dx / (dt || 0.016)) * 0.12));
    player.rollAngle += (targetRoll - player.rollAngle) * Math.min(1, dt * 22);

    if (t >= 1) {
      player.lane = player.targetLane;
      player.x = targetX;
    }
  }

  public static clampDeltaTime(dt: number): number {
    return Math.max(0, Math.min(dt, GameConfig.MAX_FRAME_DT));
  }
}
