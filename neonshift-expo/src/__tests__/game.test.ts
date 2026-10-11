import assert from 'node:assert';
import test from 'node:test';
import { GameConfig } from '../game/GameConfig';
import { Player } from '../game/Player';
import { PlayerPhysics } from '../game/PlayerPhysics';
import { Obstacle, ObstacleType } from '../game/Obstacle';
import { CollisionResult, CollisionSystem } from '../game/CollisionSystem';
import { NearMissSystem } from '../game/NearMissSystem';
import { ScoreManager } from '../game/ScoreManager';
import { DifficultyManager } from '../game/DifficultyManager';
import { DifficultyTier, GameStatus } from '../game/GameStatus';
import { PowerUpManager } from '../game/PowerUpManager';
import { PowerUpType } from '../game/PowerUp';
import { TrackGenerator } from '../game/TrackGenerator';
import { GameLoop } from '../game/GameLoop';
import { TouchControlHandler } from '../controls/TouchControlHandler';

test('Player physics: jump and gravity integration', () => {
  const player = new Player();
  assert.strictEqual(player.y, GameConfig.GROUND_Y);
  assert.strictEqual(player.isAirborne, false);

  player.jump();
  assert.strictEqual(player.isAirborne, true);
  assert.strictEqual(player.verticalVelocity, GameConfig.JUMP_VELOCITY);

  // Update half second
  PlayerPhysics.updateVertical(player, 0.1);
  assert.ok(player.y > GameConfig.GROUND_Y);

  // Land back to ground
  let landed = false;
  for (let i = 0; i < 50; i++) {
    if (PlayerPhysics.updateVertical(player, 0.05)) {
      landed = true;
      break;
    }
  }
  assert.strictEqual(landed, true);
  assert.strictEqual(player.isAirborne, false);
  assert.strictEqual(player.y, GameConfig.GROUND_Y);
});

test('Player physics: smoothstep lane tweening', () => {
  const player = new Player();
  assert.strictEqual(player.lane, 1);
  assert.strictEqual(player.x, 0);

  player.startLaneChange(0);
  assert.strictEqual(player.targetLane, 0);

  // Partial step
  PlayerPhysics.updateHorizontal(player, GameConfig.LANE_CHANGE_DURATION_S / 2);
  assert.ok(player.x < 0);
  assert.ok(player.x > player.laneCenterX(0));

  // Complete step
  PlayerPhysics.updateHorizontal(player, GameConfig.LANE_CHANGE_DURATION_S);
  assert.strictEqual(player.lane, 0);
  assert.strictEqual(player.x, player.laneCenterX(0));
});

test('Collision system: Ground Barrier, Laser, and Void Gap', () => {
  const player = new Player();
  const barrier = { id: 'o1', type: ObstacleType.GROUND_BARRIER, lane: 1, z: GameConfig.PLAYER_Z };
  const laser = { id: 'o2', type: ObstacleType.HORIZONTAL_LASER, lane: 1, z: GameConfig.PLAYER_Z };
  const voidGap = { id: 'o3', type: ObstacleType.VOID_GAP, lane: 1, z: GameConfig.PLAYER_Z };

  // On ground at player's Z position
  assert.strictEqual(CollisionSystem.evaluate(player, barrier), CollisionResult.HAZARD_HIT);
  assert.strictEqual(CollisionSystem.evaluate(player, laser), CollisionResult.HAZARD_HIT);
  assert.strictEqual(CollisionSystem.evaluate(player, voidGap), CollisionResult.VOID_FALL);

  // In air
  player.isAirborne = true;
  player.y = 1.5;
  assert.strictEqual(CollisionSystem.evaluate(player, barrier), CollisionResult.NONE);
  assert.strictEqual(CollisionSystem.evaluate(player, laser), CollisionResult.NONE);
  assert.strictEqual(CollisionSystem.evaluate(player, voidGap), CollisionResult.NONE);

  // Far ahead obstacle should NOT collide
  const farBarrier = { id: 'o4', type: ObstacleType.GROUND_BARRIER, lane: 1, z: 30 };
  assert.strictEqual(CollisionSystem.evaluate(player, farBarrier), CollisionResult.NONE);
});

test('Phase Shield absorbs collision once and clears hazard', () => {
  const powerUpManager = new PowerUpManager();
  powerUpManager.activate(PowerUpType.PHASE_SHIELD);
  assert.strictEqual(powerUpManager.isActive(PowerUpType.PHASE_SHIELD), true);

  const consumed = powerUpManager.consumeShield();
  assert.strictEqual(consumed, true);
  assert.strictEqual(powerUpManager.isActive(PowerUpType.PHASE_SHIELD), false);

  const consumedAgain = powerUpManager.consumeShield();
  assert.strictEqual(consumedAgain, false);
});

test('Near miss pays out exactly once per obstacle', () => {
  const player = new Player();
  player.x = 0; // Lane 1 center

  // Obstacle in lane 0 alongside player at GameConfig.PLAYER_Z
  player.x = -0.5; // safely outside hitbox threshold (1.40) and within near-miss radius (2.30)
  const obs: Obstacle = { id: 'obs1', type: ObstacleType.GROUND_BARRIER, lane: 0, z: GameConfig.PLAYER_Z };

  const firstMisses = NearMissSystem.collectNewNearMisses(player, [obs]);
  assert.strictEqual(firstMisses.length, 1);
  assert.strictEqual(obs.nearMissEvaluated, true);

  const secondMisses = NearMissSystem.collectNewNearMisses(player, [obs]);
  assert.strictEqual(secondMisses.length, 0);
});

test('ScoreManager: distance + shards + near miss + combo calculation', () => {
  const scoreMgr = new ScoreManager();
  assert.strictEqual(scoreMgr.score, 0);
  assert.strictEqual(scoreMgr.comboMultiplier, 1.0);

  // 100 meters, 1 shard, 1 near miss
  scoreMgr.tick(0.1, 10, 1, 1, false);
  // combo increases by 0.1 * 2 = 1.2
  assert.strictEqual(scoreMgr.comboMultiplier, 1.2);
  assert.ok(scoreMgr.score > 0);

  // Overdrive 2x multiplier
  const currentScore = scoreMgr.score;
  scoreMgr.tick(0.1, 10, 0, 0, true);
  assert.ok(scoreMgr.score > currentScore);
});

test('DifficultyManager: tier progression and speed curve', () => {
  assert.strictEqual(DifficultyManager.tierFor(0), DifficultyTier.GRID_ZERO);
  assert.strictEqual(DifficultyManager.tierFor(500), DifficultyTier.CYBER_SHIFT);
  assert.strictEqual(DifficultyManager.tierFor(1200), DifficultyTier.HYPER_PULSE);
  assert.strictEqual(DifficultyManager.tierFor(2500), DifficultyTier.OVERDRIVE);

  const speedZero = DifficultyManager.speedFor(0, false);
  const speedCyber = DifficultyManager.speedFor(1000, false);
  assert.ok(speedCyber > speedZero);

  // Chrono warp slows speed
  const speedChrono = DifficultyManager.speedFor(1000, true);
  assert.ok(speedChrono < speedCyber);
});

test('TrackGenerator: always leaves at least one clear passable lane', () => {
  const generator = new TrackGenerator();
  for (let i = 0; i < 50; i++) {
    const row = generator.generateRow(60, DifficultyTier.OVERDRIVE);
    const blockedLanes = new Set(row.obstacles.map((o) => o.lane));
    assert.ok(blockedLanes.size < GameConfig.LANE_COUNT, `Row ${i} blocked all lanes!`);
  }
});

test('TouchControlHandler: swipe detection', () => {
  const touch = new TouchControlHandler(45, 45);

  // Swipe Left
  touch.onDragStart(200, 300);
  touch.onDrag(-80, 0);
  const actionLeft = touch.onDragEnd();
  assert.deepStrictEqual(actionLeft, { type: 'MoveLeft' });

  // Swipe Up (Jump)
  touch.onDragStart(200, 300);
  touch.onDrag(0, -90);
  const actionJump = touch.onDragEnd();
  assert.deepStrictEqual(actionJump, { type: 'Jump' });
});

test('Hold-to-boost: increases speed and resets on release', () => {
  const loop = new GameLoop();
  loop.start();
  const normalSpeed = loop.toUiState(0).speed;

  loop.setBoosting(true);
  const boostSpeed = loop.toUiState(0).speed;
  assert.ok(boostSpeed > normalSpeed);
  assert.strictEqual(boostSpeed, normalSpeed * GameConfig.BOOST_SPEED_MULTIPLIER);

  loop.setBoosting(false);
  const releasedSpeed = loop.toUiState(0).speed;
  assert.strictEqual(releasedSpeed, normalSpeed);
});

test('StageManager: 100 progressive stages with custom initial distances', () => {
  const { StageManager } = require('../game/StageManager');
  assert.strictEqual(StageManager.MAX_STAGES, 100);

  // Stage 1 = 1000m, Stage 2 = 1500m, Stage 3 = 1800m
  assert.strictEqual(StageManager.getStageLength(1), 1000);
  assert.strictEqual(StageManager.getStageLength(2), 1500);
  assert.strictEqual(StageManager.getStageLength(3), 1800);

  const thresholds = StageManager.getThresholds();
  assert.strictEqual(thresholds.length, 101);
  assert.strictEqual(thresholds[1], 1000); // Stage 1 cumulative
  assert.strictEqual(thresholds[2], 2500); // Stage 2 cumulative (1000 + 1500)
  assert.strictEqual(thresholds[3], 4300); // Stage 3 cumulative (2500 + 1800)

  // Stage info telemetry
  const s500 = StageManager.getStageInfo(500);
  assert.strictEqual(s500.stage, 1);
  assert.strictEqual(s500.progressPct, 0.5);
  assert.strictEqual(s500.stageTargetMeters, 1000);

  const s1200 = StageManager.getStageInfo(1200);
  assert.strictEqual(s1200.stage, 2);
  assert.strictEqual(s1200.stageStartMeters, 1000);
  assert.strictEqual(s1200.stageTargetMeters, 2500);
});

test('GameLoop: Blaster firing consumes ammo and spawns projectile', () => {
  const loop = new GameLoop();
  loop.start();
  const initialAmmo = loop.ammo;
  assert.strictEqual(initialAmmo, 5);

  const fired = loop.requestFireBlaster();
  assert.strictEqual(fired, true);
  assert.strictEqual(loop.ammo, 4);

  const state = loop.toUiState(0);
  assert.strictEqual(state.ammo, 4);
  assert.strictEqual(state.projectileSnapshot.length, 1);
});

test('Reward Systems: Vehicle skin catalog and color palette definitions', () => {
  const { VEHICLE_SKINS, DEFAULT_SKIN_ID } = require('../game/VehicleSkins');
  assert.strictEqual(DEFAULT_SKIN_ID, 'CYBER_CYAN');

  // Verify all 5 skins exist and have complete color palettes
  const expectedSkins = ['CYBER_CYAN', 'SOLAR_GOLD', 'CRIMSON_FURY', 'VOID_PHANTOM', 'EMERALD_VIPER'];
  for (const id of expectedSkins) {
    const skin = VEHICLE_SKINS[id];
    assert.ok(skin, `Skin ${id} must exist in catalog`);
    assert.strictEqual(skin.palette.wingColor.length, 4);
    assert.strictEqual(skin.palette.armorColor.length, 4);
    assert.strictEqual(skin.palette.finColor.length, 4);
    assert.strictEqual(skin.palette.jetOuterColor.length, 4);
  }

  // Solar Phoenix must be the exclusive share reward craft
  assert.strictEqual(VEHICLE_SKINS['SOLAR_GOLD'].unlockWithShare, true);
  assert.strictEqual(VEHICLE_SKINS['CYBER_CYAN'].unlockedByDefault, true);
});

test('Reward Systems: Equipping vehicle skin propagates to GameUiState', () => {
  const loop = new GameLoop();
  loop.start({ equippedSkin: 'SOLAR_GOLD' });
  const state = loop.toUiState(0);
  assert.strictEqual(state.equippedSkin, 'SOLAR_GOLD');

  loop.setEquippedSkin('VOID_PHANTOM');
  const updatedState = loop.toUiState(0);
  assert.strictEqual(updatedState.equippedSkin, 'VOID_PHANTOM');
});

test('Reward Systems: Headstart Nitro Boost grants temporary 4s hypersonic boost', () => {
  const loop = new GameLoop();
  // Start with headstart nitro perk active
  loop.start({ hasHeadstartNitro: true });

  const initialState = loop.toUiState(0);
  assert.strictEqual(initialState.isBoosting, true);
  assert.strictEqual(initialState.headstartActive, true);
  assert.strictEqual(initialState.speed, 9 * 1.6); // Base speed 9 * 1.6x boost = 14.4

  // Simulate 2 seconds with standard frame steps (20 x 0.1s)
  for (let i = 0; i < 20; i++) {
    loop.update(0.1);
  }
  const midState = loop.toUiState(0);
  assert.strictEqual(midState.isBoosting, true);
  assert.strictEqual(midState.headstartActive, true);

  // Simulate another 25 steps (2.5 seconds, total 4.5s > 4.0s duration) - should revert to normal cruise speed
  for (let i = 0; i < 25; i++) {
    loop.update(0.1);
  }
  const finalState = loop.toUiState(0);
  assert.strictEqual(finalState.isBoosting, false);
  assert.strictEqual(finalState.headstartActive, false);
});

test('Stage progression: Stage clear pauses loop for celebration and advancing launches into next stage', () => {
  let clearedStageReported = 0;
  const loop = new GameLoop((event) => {
    if (event.type === 'StageCleared') {
      clearedStageReported = event.stage;
    }
  });
  loop.start();

  // Simulate reaching end of Stage 1 (1000m threshold)
  (loop as any).totalDistance = 999.5;
  loop.update(0.1); // crosses 1000m mark

  assert.strictEqual(clearedStageReported, 1);
  assert.strictEqual(loop.status, GameStatus.PAUSED);

  // Player presses "NEXT LEVEL" -> calls advanceToNextStage()
  loop.advanceToNextStage();
  assert.strictEqual(loop.status, GameStatus.RUNNING);
  const nextState = loop.toUiState(0);
  assert.strictEqual(nextState.isBoosting, true);
  assert.strictEqual(nextState.currentStage, 2);
});

test('Score Sharing: Beat My Score card formatting generates high score, distance, and viral challenge tags', () => {
  const mockState = {
    score: 18450,
    distanceMeters: 2840,
    currentStage: 3,
    maxCombo: 4.5,
    shardsCollected: 38,
    equippedSkin: 'SOLAR_GOLD' as const,
  };
  const gamerTag = 'CYBER_ACE';

  const shareText = `🚀 Can you beat my high score in JOESHIFT?\n\n` +
    `⚡ SCORE: ${mockState.score.toLocaleString()} PTS\n` +
    `📍 DISTANCE: ${mockState.distanceMeters}m (Stage ${mockState.currentStage})\n` +
    `🔥 MAX COMBO: x${mockState.maxCombo.toFixed(1)}\n` +
    `🛸 PILOT: ${gamerTag} [Craft: SOLAR PHOENIX]\n\n` +
    `Can you survive the hypersonic neon grid? Play now: https://joeshift.game/join\n\n` +
    `#JOESHIFT #BeatMyScore #CyberRunner #IndieGame`;

  assert.ok(shareText.includes('18,450 PTS'));
  assert.ok(shareText.includes('2840m (Stage 3)'));
  assert.ok(shareText.includes('CYBER_ACE'));
  assert.ok(shareText.includes('SOLAR PHOENIX'));
  assert.ok(shareText.includes('#JOESHIFT'));
  assert.ok(shareText.includes('#BeatMyScore'));
  assert.ok(shareText.includes('https://joeshift.game/join'));
});

test('GameLoop: intro launch progress at start smoothly moves machine into flight position', () => {
  const loop = new GameLoop();
  loop.start();
  const stateStart = loop.toUiState(0);
  assert.strictEqual(stateStart.introLaunchProgress, 0);

  // Update in realistic frame increments (5 frames of 0.09s = 0.45s)
  for (let i = 0; i < 5; i++) {
    loop.update(0.09);
  }
  const stateMid = loop.toUiState(0);
  assert.ok(stateMid.introLaunchProgress >= 0.45 && stateMid.introLaunchProgress <= 0.55);

  // Update past intro duration (6 frames of 0.09s)
  for (let i = 0; i < 6; i++) {
    loop.update(0.09);
  }
  const stateEnd = loop.toUiState(0);
  assert.strictEqual(stateEnd.introLaunchProgress, 1.0);
});


