import { CollectibleManager } from './CollectibleManager';
import { CollisionResult, CollisionSystem } from './CollisionSystem';
import { DifficultyManager } from './DifficultyManager';
import { GameConfig } from './GameConfig';
import { GameEvent } from './GameEvent';
import { DifficultyTier, GameStatus } from './GameStatus';
import { GameUiState, RenderObstacle, RenderPowerUp, RenderProjectile, RenderShard } from './GameUiState';
import { NearMissSystem } from './NearMissSystem';
import { ObstacleManager } from './ObstacleManager';
import { Player } from './Player';
import { PlayerPhysics } from './PlayerPhysics';
import { PowerUpManager } from './PowerUpManager';
import { PowerUpType } from './PowerUp';
import { ScoreManager } from './ScoreManager';
import { StageManager } from './StageManager';
import { TrackGenerator } from './TrackGenerator';
import { DEFAULT_SKIN_ID, SkinId } from './VehicleSkins';

export class GameLoop {
  public readonly player = new Player();
  public readonly obstacleManager = new ObstacleManager();
  public readonly collectibleManager = new CollectibleManager();
  public readonly powerUpManager = new PowerUpManager();
  private readonly scoreManager = new ScoreManager();
  private readonly trackGenerator = new TrackGenerator();

  private _status: GameStatus = GameStatus.MENU;
  private totalDistance: number = 0;
  private timeSinceLastSpawn: number = 0;
  private timeSinceLastGridShift: number = 0;

  private isGridShifting: boolean = false;
  private gridShiftWarningActive: boolean = false;
  private gridShiftTimer: number = 0;

  private shardsCollected: number = 0;
  private nearMisses: number = 0;
  private isBoosting: boolean = false;
  private manualBoosting: boolean = false;
  private headstartBoostTimer: number = 0;
  private gameOverCause: string | null = null;

  public equippedSkin: SkinId = DEFAULT_SKIN_ID;
  public ammo: number = 5;
  public readonly maxAmmo: number = 5;
  private projectiles: { id: string; lane: number; z: number; speed: number }[] = [];
  private lastStageCompleted: number = 0;
  private stageCelebrationTimer: number = 0;
  private stageCelebrationText: string | null = null;
  public introLaunchTimer: number = 0.9;
  public static readonly INTRO_LAUNCH_DURATION = 0.9;

  constructor(private readonly onEvent: (event: GameEvent) => void = () => {}) {}

  public get status(): GameStatus {
    return this._status;
  }

  public start(options?: {
    equippedSkin?: SkinId;
    hasHeadstartNitro?: boolean;
    startStage?: number;
  }): void {
    this.reset();
    this.introLaunchTimer = GameLoop.INTRO_LAUNCH_DURATION;
    if (options?.equippedSkin) {
      this.equippedSkin = options.equippedSkin;
    }
    if (options?.startStage && options.startStage > 1) {
      const startingStage = Math.min(StageManager.MAX_STAGES, Math.max(1, options.startStage));
      const thresholds = StageManager.getThresholds();
      this.totalDistance = thresholds[startingStage - 1];
      this.lastStageCompleted = startingStage - 1;
      this.stageCelebrationText = `STAGE ${startingStage} RESUMED`;
      this.stageCelebrationTimer = 2.4;
    }
    if (options?.hasHeadstartNitro) {
      this.headstartBoostTimer = 4.0;
      this.isBoosting = true;
      this.stageCelebrationText = 'NITRO HEADSTART ACTIVE';
      this.stageCelebrationTimer = 3.5;
      this.onEvent({ type: 'BoostStarted' });
    }
    this._status = GameStatus.RUNNING;
  }

  public setEquippedSkin(skin: SkinId): void {
    this.equippedSkin = skin;
  }

  public pause(): void {
    if (this._status === GameStatus.RUNNING) {
      this._status = GameStatus.PAUSED;
    }
  }

  public resume(): void {
    if (this._status === GameStatus.PAUSED) {
      this._status = GameStatus.RUNNING;
    }
  }

  public advanceToNextStage(): void {
    this.obstacleManager.clearNearby(GameConfig.PLAYER_Z - 5, GameConfig.PLAYER_Z + 40);
    this.headstartBoostTimer = 1.6;
    this.isBoosting = true;
    const nextStageNum = this.lastStageCompleted + 1;
    this.stageCelebrationText = `STAGE ${nextStageNum} ENGAGED`;
    this.stageCelebrationTimer = 2.2;
    this._status = GameStatus.RUNNING;
    this.onEvent({ type: 'BoostStarted' });
  }

  public stop(): void {
    this._status = GameStatus.MENU;
  }

  public reset(): void {
    this.player.reset();
    this.obstacleManager.reset();
    this.collectibleManager.reset();
    this.powerUpManager.reset();
    this.scoreManager.reset();
    this.totalDistance = 0;
    this.timeSinceLastSpawn = 0;
    this.timeSinceLastGridShift = 0;
    this.isGridShifting = false;
    this.gridShiftWarningActive = false;
    this.gridShiftTimer = 0;
    this.shardsCollected = 0;
    this.nearMisses = 0;
    this.isBoosting = false;
    this.manualBoosting = false;
    this.headstartBoostTimer = 0;
    this.gameOverCause = null;
    this.ammo = 5;
    this.projectiles = [];
    this.lastStageCompleted = 0;
    this.stageCelebrationTimer = 0;
    this.stageCelebrationText = null;
    this.introLaunchTimer = GameLoop.INTRO_LAUNCH_DURATION;
  }

  // --- Input handlers ---
  public requestFireBlaster(): boolean {
    if (this._status !== GameStatus.RUNNING || this.ammo <= 0) return false;
    this.ammo--;
    const id = `blaster_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.projectiles.push({
      id,
      lane: this.player.targetLane,
      z: GameConfig.PLAYER_Z + GameConfig.PLAYER_HITBOX_FRONT + 0.2,
      speed: 85,
    });
    this.onEvent({ type: 'BlasterFired' });
    return true;
  }

  public requestLaneLeft(): void {
    if (this._status !== GameStatus.RUNNING) return;
    const from = this.player.targetLane;
    this.player.startLaneChange(this.player.targetLane - 1);
    if (this.player.targetLane !== from) {
      this.onEvent({ type: 'LaneChanged', fromLane: from, toLane: this.player.targetLane });
    }
  }

  public requestLaneRight(): void {
    if (this._status !== GameStatus.RUNNING) return;
    const from = this.player.targetLane;
    this.player.startLaneChange(this.player.targetLane + 1);
    if (this.player.targetLane !== from) {
      this.onEvent({ type: 'LaneChanged', fromLane: from, toLane: this.player.targetLane });
    }
  }

  public requestJump(): void {
    if (this._status !== GameStatus.RUNNING) return;
    if (!this.player.isAirborne) {
      this.player.jump();
      this.onEvent({ type: 'Jumped' });
    }
  }

  public setBoosting(boosting: boolean): void {
    this.manualBoosting = boosting;
    if (this._status !== GameStatus.RUNNING) {
      this.isBoosting = false;
      return;
    }
    const effectiveBoosting = boosting || this.headstartBoostTimer > 0;
    if (this.isBoosting !== effectiveBoosting) {
      this.isBoosting = effectiveBoosting;
      if (effectiveBoosting) {
        this.onEvent({ type: 'BoostStarted' });
      } else {
        this.onEvent({ type: 'BoostEnded' });
      }
    }
  }

  public requestDrag(deltaXPx: number, pxPerLane: number): void {
    if (this._status !== GameStatus.RUNNING || pxPerLane <= 0) return;
    if (Math.abs(deltaXPx) >= pxPerLane / 2) {
      if (deltaXPx < 0) {
        this.requestLaneLeft();
      } else {
        this.requestLaneRight();
      }
    }
  }

  /**
   * Single authoritative simulation step with clamped delta-time.
   */
  public update(dt: number): void {
    if (this._status !== GameStatus.RUNNING) return;

    const safeDt = PlayerPhysics.clampDeltaTime(dt);

    if (this.introLaunchTimer > 0) {
      this.introLaunchTimer = Math.max(0, this.introLaunchTimer - safeDt);
    }

    // Update headstart boost countdown
    if (this.headstartBoostTimer > 0) {
      this.headstartBoostTimer -= safeDt;
      if (this.headstartBoostTimer <= 0) {
        this.headstartBoostTimer = 0;
        if (!this.manualBoosting) {
          this.isBoosting = false;
          this.onEvent({ type: 'BoostEnded' });
        }
      } else {
        this.isBoosting = true;
      }
    }

    const tier = DifficultyManager.tierFor(Math.floor(this.totalDistance));
    const chronoActive = this.powerUpManager.isActive(PowerUpType.CHRONO_WARP);
    const speed = DifficultyManager.speedFor(
      Math.floor(this.totalDistance),
      chronoActive,
      this.isBoosting
    );

    this.updateGridShift(safeDt, tier);
    this.updatePlayer(safeDt);
    this.updateWorldAndSpawns(safeDt, speed, tier);

    const shardEvents = this.updateCollectibles(speed, safeDt);
    this.updatePowerUps(speed, safeDt);
    const nearMissEvents = this.updateNearMisses();
    const collided = this.updateCollisions();

    const distanceDeltaMeters = speed * safeDt;
    this.totalDistance += distanceDeltaMeters;

    // Stage Progression & Threshold check
    const stageInfo = StageManager.getStageInfo(Math.floor(this.totalDistance));
    if (stageInfo.stage > this.lastStageCompleted + 1) {
      const completedStage = this.lastStageCompleted + 1;
      this.lastStageCompleted = completedStage;
      this.ammo = Math.min(this.maxAmmo, this.ammo + 2); // Refill ammo on stage clear!
      this.scoreManager.addBonusScore(500); // +500 PTS Stage clear reward!
      this.stageCelebrationText = `STAGE ${completedStage} CLEARED`;
      this.stageCelebrationTimer = 2.5;
      this.obstacleManager.clearNearby(GameConfig.PLAYER_Z - 5, GameConfig.PLAYER_Z + 35);
      this._status = GameStatus.PAUSED;
      this.isBoosting = false;
      this.onEvent({
        type: 'StageCleared',
        stage: completedStage,
        targetMeters: stageInfo.stageStartMeters,
        nextStage: stageInfo.stage,
      });
      return;
    }

    if (this.stageCelebrationTimer > 0) {
      this.stageCelebrationTimer -= safeDt;
      if (this.stageCelebrationTimer <= 0) {
        this.stageCelebrationText = null;
      }
    }

    // Update Blaster Projectiles
    this.updateProjectiles(safeDt);

    this.scoreManager.tick(
      safeDt,
      distanceDeltaMeters,
      shardEvents,
      nearMissEvents,
      this.powerUpManager.isActive(PowerUpType.OVERDRIVE)
    );

    if (collided) {
      this._status = GameStatus.GAME_OVER;
      this.onEvent({ type: 'GameOver' });
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.z += p.speed * dt;

      // Check collision with hazards in the same lane
      let hit = false;
      for (const o of this.obstacleManager.active) {
        if (o.lane === p.lane && Math.abs(o.z - p.z) < 1.4 && o.z >= 0) {
          hit = true;
          this.obstacleManager.remove(o);
          // Bonus score for blasting hazard!
          this.scoreManager.tick(dt, 0, 0, 2, false);
          this.onEvent({ type: 'ObstacleBlasted', obstacleId: o.id });
          break;
        }
      }

      if (hit || p.z > 62) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updatePlayer(dt: number): void {
    const landed = PlayerPhysics.updateVertical(this.player, dt);
    if (landed) {
      this.onEvent({ type: 'Landed' });
    }
    PlayerPhysics.updateHorizontal(this.player, dt);
  }

  private updateGridShift(dt: number, tier: DifficultyTier): void {
    const interval = DifficultyManager.gridShiftIntervalFor(tier);

    if (this.isGridShifting) {
      this.gridShiftTimer -= dt;
      if (this.gridShiftTimer <= 0) {
        this.isGridShifting = false;
        this.onEvent({ type: 'GridShiftEnded' });
        this.timeSinceLastGridShift = 0;
      }
      return;
    }

    if (this.gridShiftWarningActive) {
      this.gridShiftTimer -= dt;
      if (this.gridShiftTimer <= 0) {
        this.gridShiftWarningActive = false;
        this.isGridShifting = true;
        this.gridShiftTimer = GameConfig.GRID_SHIFT_DURATION_S;
        this.onEvent({ type: 'GridShiftStarted' });
      }
      return;
    }

    this.timeSinceLastGridShift += dt;
    if (this.timeSinceLastGridShift >= interval) {
      this.gridShiftWarningActive = true;
      this.gridShiftTimer = GameConfig.GRID_SHIFT_WARNING_S;
      this.onEvent({ type: 'GridShiftWarning' });
    }
  }

  private updateWorldAndSpawns(dt: number, speed: number, tier: DifficultyTier): void {
    this.obstacleManager.update(speed, dt);
    const spawnInterval = DifficultyManager.spawnIntervalFor(tier);

    this.timeSinceLastSpawn += dt;
    if (this.timeSinceLastSpawn >= spawnInterval) {
      this.timeSinceLastSpawn = 0;
      const batch = this.trackGenerator.generateRow(GameConfig.SPAWN_Z, tier);
      for (const o of batch.obstacles) {
        this.obstacleManager.spawn(o);
      }
      for (const s of batch.shards) {
        this.collectibleManager.spawn(s);
      }
      for (const p of batch.powerUps) {
        this.powerUpManager.spawn(p);
      }
    }
  }

  private updateCollectibles(speed: number, dt: number): number {
    this.collectibleManager.update(speed, dt);
    const magnetActive = this.powerUpManager.isActive(PowerUpType.ENERGY_MAGNET);
    const collected = this.collectibleManager.collectInRange(this.player, magnetActive, dt);

    for (const s of collected) {
      this.shardsCollected++;
      this.onEvent({ type: 'Collected', shardId: s.id });
    }
    return collected.length;
  }

  private updatePowerUps(speed: number, dt: number): void {
    this.powerUpManager.updatePickups(speed, dt);
    const expired = this.powerUpManager.tickActive(dt);
    for (const expType of expired) {
      this.onEvent({ type: 'PowerUpExpired', powerUpType: expType });
    }

    const collected = this.powerUpManager.checkPickups(this.player);
    for (const p of collected) {
      this.powerUpManager.activate(p.type);
      this.onEvent({ type: 'PowerUpActivated', powerUpType: p.type });
    }
  }

  private updateNearMisses(): number {
    const misses = NearMissSystem.collectNewNearMisses(this.player, this.obstacleManager.active);
    for (const m of misses) {
      this.nearMisses++;
      this.onEvent({ type: 'NearMiss', obstacleId: m.id });
    }
    return misses.length;
  }

  /**
   * Returns true if this frame ended the run.
   */
  private updateCollisions(): boolean {
    const hit = CollisionSystem.evaluateAll(this.player, this.obstacleManager.active);
    if (!hit) return false;

    const { obstacle, result } = hit;
    if (result === CollisionResult.NONE) return false;

    const cause = result === CollisionResult.VOID_FALL ? 'VOID GAP' : obstacle.type.replace('_', ' ');

    // Check Phase Shield
    if (this.powerUpManager.consumeShield()) {
      this.onEvent({ type: 'ShieldConsumed' });
      this.obstacleManager.remove(obstacle);
      return false;
    }

    this.gameOverCause = cause;
    this.onEvent({ type: 'Collision', cause });
    return true;
  }

  public toUiState(bestScore: number): GameUiState {
    const distanceMetersInt = Math.floor(this.totalDistance);
    const tier = DifficultyManager.tierFor(distanceMetersInt);

    const activePowerUps = Array.from(this.powerUpManager.active.keys());
    const activePowerUpTimers: Record<string, { remaining: number; total: number }> = {};
    for (const [type, effect] of this.powerUpManager.active.entries()) {
      activePowerUpTimers[type] = {
        remaining: effect.remainingSeconds,
        total: effect.totalDuration,
      };
    }

    const newHighScore = this._status === GameStatus.GAME_OVER && this.scoreManager.score > bestScore;
    if (newHighScore) {
      this.onEvent({ type: 'NewHighScore', score: this.scoreManager.score });
    }

    const obstacleSnapshot: RenderObstacle[] = this.obstacleManager.active.map((o) => ({
      id: o.id,
      lane: o.lane,
      z: o.z,
      type: o.type,
    }));

    const shardSnapshot: RenderShard[] = this.collectibleManager.active.map((s) => ({
      id: s.id,
      lane: s.lane,
      z: s.z,
    }));

    const powerUpSnapshot: RenderPowerUp[] = this.powerUpManager.pickups.map((p) => ({
      id: p.id,
      lane: p.lane,
      z: p.z,
      type: p.type,
    }));

    const stageInfo = StageManager.getStageInfo(distanceMetersInt);

    const projectileSnapshot: RenderProjectile[] = this.projectiles.map((p) => ({
      id: p.id,
      lane: p.lane,
      z: p.z,
    }));

    return {
      status: this._status,
      score: this.scoreManager.score,
      distanceMeters: distanceMetersInt,
      comboMultiplier: this.scoreManager.comboMultiplier,
      speed: DifficultyManager.speedFor(
        distanceMetersInt,
        this.powerUpManager.isActive(PowerUpType.CHRONO_WARP),
        this.isBoosting
      ),
      isGridShifting: this.isGridShifting,
      gridShiftWarning: this.gridShiftWarningActive,
      activePowerUps,
      activePowerUpTimers,
      playerLane: this.player.lane,
      playerX: this.player.x,
      playerY: this.player.y,
      playerRoll: this.player.rollAngle,
      playerSquashY: this.player.squashY,
      playerSquashX: this.player.squashX,
      playerLandingShockwave: this.player.landingShockwave,
      isJumping: this.player.isAirborne,
      tier,
      shardsCollected: this.shardsCollected,
      nearMisses: this.nearMisses,
      maxCombo: this.scoreManager.maxComboReached,
      isBoosting: this.isBoosting,
      gameOverCause: this.gameOverCause,
      currentStage: stageInfo.stage,
      stageTargetMeters: stageInfo.stageTargetMeters,
      stageLengthMeters: stageInfo.stageLengthMeters,
      stageProgressPct: stageInfo.progressPct,
      stageCelebrationText: this.stageCelebrationText,
      ammo: this.ammo,
      maxAmmo: this.maxAmmo,
      equippedSkin: this.equippedSkin,
      headstartActive: this.headstartBoostTimer > 0,
      introLaunchProgress: this.introLaunchTimer > 0 ? (1.0 - this.introLaunchTimer / GameLoop.INTRO_LAUNCH_DURATION) : 1.0,
      obstacleSnapshot,
      shardSnapshot,
      powerUpSnapshot,
      projectileSnapshot,
    };
  }
}
