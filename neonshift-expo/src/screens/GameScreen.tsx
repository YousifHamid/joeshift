import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Colors } from '../theme/colors';
import { GameEvent } from '../game/GameEvent';
import { GameLoop } from '../game/GameLoop';
import { GameStatus } from '../game/GameStatus';
import { defaultGameUiState, GameUiState } from '../game/GameUiState';
import { GLGameRenderer } from '../renderer/GLGameRenderer';
import { SoundEffects } from '../audio/SoundEffects';
import { HapticsManager } from '../audio/HapticsManager';
import { GameSettings, LocalGameRepository } from '../data/LocalGameRepository';
import { GameHud } from '../components/GameHud';
import { VirtualControls } from '../components/VirtualControls';
import { PauseModal } from '../components/PauseModal';
import { GameOverModal } from '../components/GameOverModal';
import { StageClearedModal } from '../components/StageClearedModal';
import { FastStartAlert } from '../components/FastStartAlert';
import { DEFAULT_SKIN_ID, SkinId } from '../game/VehicleSkins';

interface GameScreenProps {
  bestScore: number;
  gamerTag: string;
  settings: GameSettings;
  equippedSkin?: SkinId;
  hasHeadstartNitro?: boolean;
  onConsumeHeadstartNitro?: () => Promise<void>;
  onClaimShareReward?: () => Promise<void>;
  onReturnToMenu: () => void;
  onRefreshRecords: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  bestScore,
  gamerTag,
  settings,
  equippedSkin = DEFAULT_SKIN_ID,
  hasHeadstartNitro = false,
  onConsumeHeadstartNitro,
  onClaimShareReward,
  onReturnToMenu,
  onRefreshRecords,
}) => {
  const { width, height } = Dimensions.get('window');

  const [uiState, setUiState] = useState<GameUiState>(defaultGameUiState);
  const [isNewBest, setIsNewBest] = useState(false);
  const [creditsEarned, setCreditsEarned] = useState(0);
  const [stageClearedInfo, setStageClearedInfo] = useState<{ stage: number } | null>(null);
  const [showStartAlert, setShowStartAlert] = useState<boolean>(true);

  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<GLGameRenderer>(new GLGameRenderer());

  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasBoostedRef = useRef<boolean>(false);

  // Initialize Audio & Haptics settings
  useEffect(() => {
    SoundEffects.setSfxEnabled(settings.sfxEnabled);
    SoundEffects.setMusicEnabled(settings.musicEnabled);
    HapticsManager.setEnabled(settings.hapticsEnabled);
    SoundEffects.init().then(() => {
      if (settings.musicEnabled) {
        SoundEffects.startBgm();
      }
    });

    return () => {
      SoundEffects.stopBgm();
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [settings]);

  // Event dispatcher from GameLoop
  const handleGameEvent = (event: GameEvent) => {
    switch (event.type) {
      case 'LaneChanged':
        HapticsManager.laneShift();
        SoundEffects.playLaneShift();
        break;
      case 'Jumped':
        HapticsManager.jump();
        SoundEffects.playJump();
        break;
      case 'Landed':
        HapticsManager.land();
        SoundEffects.playLand();
        break;
      case 'Collected':
        HapticsManager.collect();
        SoundEffects.playCollect();
        break;
      case 'PowerUpActivated':
        HapticsManager.powerUp();
        SoundEffects.playPowerUp();
        break;
      case 'NearMiss':
        HapticsManager.nearMiss();
        SoundEffects.playNearMiss();
        break;
      case 'ShieldConsumed':
        HapticsManager.shieldBreak();
        SoundEffects.playShieldBreak();
        break;
      case 'GridShiftWarning':
        SoundEffects.playWarning();
        break;
      case 'GridShiftStarted':
        HapticsManager.gridShift();
        break;
      case 'BoostStarted':
        HapticsManager.boostStart();
        SoundEffects.playBoost();
        break;
      case 'BoostEnded':
        break;
      case 'BlasterFired':
        HapticsManager.fire();
        SoundEffects.playBlaster();
        break;
      case 'ObstacleBlasted':
        HapticsManager.explosion();
        SoundEffects.playExplosion();
        break;
      case 'StageCleared':
        HapticsManager.stageClear();
        SoundEffects.playStageClear();
        LocalGameRepository.addCredits(100);
        onRefreshRecords();
        setStageClearedInfo({ stage: event.stage });
        break;
      case 'Collision':
        HapticsManager.collision();
        SoundEffects.playCollision();
        break;
      case 'GameOver':
        handleGameOver();
        break;
    }
  };

  // Instantiating GameLoop
  useEffect(() => {
    const loop = new GameLoop(handleGameEvent);
    gameLoopRef.current = loop;
    loop.start({ equippedSkin, hasHeadstartNitro });
    if (hasHeadstartNitro && onConsumeHeadstartNitro) {
      onConsumeHeadstartNitro();
    }
    isRunningRef.current = true;
    lastTimeRef.current = performance.now();

    // Start frame simulation
    const tick = (now: number) => {
      const loopInstance = gameLoopRef.current;
      if (loopInstance && isRunningRef.current) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = now;

        loopInstance.update(dt);
        const nextState = loopInstance.toUiState(bestScore);
        setUiState(nextState);
      }
      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      isRunningRef.current = false;
    };
  }, []);

  const handleGameOver = async () => {
    setStageClearedInfo(null);
    gameLoopRef.current?.setBoosting(false);
    // Stop BGM completely on death / Run Terminated screen
    SoundEffects.stopBgm();
    const loop = gameLoopRef.current;
    if (!loop) return;
    const finalState = loop.toUiState(bestScore);

    const record = {
      runId: LocalGameRepository.generateRunId(),
      gamerTag: gamerTag || 'PLAYER',
      score: finalState.score,
      distanceMeters: finalState.distanceMeters,
      shardsCollected: finalState.shardsCollected,
      nearMisses: finalState.nearMisses,
      maxCombo: finalState.maxCombo,
      timestampMillis: Date.now(),
    };

    const { isNewBestScore, creditsEarned: earned } = await LocalGameRepository.saveRun(record);
    setIsNewBest(isNewBestScore);
    setCreditsEarned(earned);
    onRefreshRecords();
  };

  const handleRestart = async () => {
    setStageClearedInfo(null);
    setIsNewBest(false);
    setShowStartAlert(true);
    const hasPerk = await LocalGameRepository.getHeadstartNitroPerk();
    if (hasPerk && onConsumeHeadstartNitro) {
      await onConsumeHeadstartNitro();
    }
    gameLoopRef.current?.start({ equippedSkin, hasHeadstartNitro: hasPerk });
    lastTimeRef.current = performance.now();
    SoundEffects.resumeBgm();
  };

  const handleNextLevel = () => {
    setStageClearedInfo(null);
    HapticsManager.boostStart();
    SoundEffects.playPowerUp();
    gameLoopRef.current?.advanceToNextStage();
    lastTimeRef.current = performance.now();
  };

  const handlePause = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    gameLoopRef.current?.setBoosting(false);
    gameLoopRef.current?.pause();
    SoundEffects.pauseBgm();
  };

  const handleResume = () => {
    gameLoopRef.current?.resume();
    lastTimeRef.current = performance.now();
    SoundEffects.resumeBgm();
  };

  // GL Context callback
  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    rendererRef.current.init(gl);

    const renderLoop = () => {
      const loopInstance = gameLoopRef.current;
      if (loopInstance) {
        const currentState = loopInstance.toUiState(bestScore);
        rendererRef.current.render(currentState, gl.drawingBufferWidth, gl.drawingBufferHeight, 0.016);
      }
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  };

  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSteerXRef = useRef<number>(0);
  const hasShiftedInGestureRef = useRef<boolean>(false);
  const hasJumpedInGestureRef = useRef<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);

  // Touch gesture classification using PanResponder with long-press boost & smooth steering
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        hasBoostedRef.current = false;
        hasShiftedInGestureRef.current = false;
        hasJumpedInGestureRef.current = false;
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

        const pageX = evt.nativeEvent.pageX;
        const pageY = evt.nativeEvent.pageY;
        touchStartPosRef.current = { x: pageX, y: pageY };
        lastSteerXRef.current = pageX;

        // Long press trigger: holding screen for 160ms engages Nitro Boost
        holdTimerRef.current = setTimeout(() => {
          hasBoostedRef.current = true;
          gameLoopRef.current?.setBoosting(true);
        }, 160);
      },
      onPanResponderMove: (evt, gestureState) => {
        const pageX = evt.nativeEvent.pageX;
        const pageY = evt.nativeEvent.pageY;
        const deltaXFromSteer = pageX - lastSteerXRef.current;
        const deltaYTotal = pageY - touchStartPosRef.current.y;

        // Jump on swipe UP & hold up to nitro boost
        if (deltaYTotal <= -30) {
          if (!hasJumpedInGestureRef.current) {
            gameLoopRef.current?.requestJump();
            hasJumpedInGestureRef.current = true;
            setShowStartAlert(false);
          }
          if (!hasBoostedRef.current) {
            hasBoostedRef.current = true;
            gameLoopRef.current?.setBoosting(true);
          }
        }

        // Steer Left / Right: effortlessly shifts lanes every ~28px of lateral movement
        // Enables effortless dodging while holding down at top nitro speed!
        if (deltaXFromSteer <= -28) {
          gameLoopRef.current?.requestLaneLeft();
          lastSteerXRef.current = pageX;
          hasShiftedInGestureRef.current = true;
        } else if (deltaXFromSteer >= 28) {
          gameLoopRef.current?.requestLaneRight();
          lastSteerXRef.current = pageX;
          hasShiftedInGestureRef.current = true;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        // Releasing immediately restores normal cruising speed
        gameLoopRef.current?.setBoosting(false);
        const wasBoosting = hasBoostedRef.current;
        hasBoostedRef.current = false;

        // Check for Tap or quick flick if no lane shift happened during drag
        if (!hasShiftedInGestureRef.current && !hasJumpedInGestureRef.current && !wasBoosting) {
          const moveDist = Math.hypot(gestureState.dx, gestureState.dy);
          if (moveDist < 16) {
            // Tap on upper empty screen area triggers pause
            if (touchStartPosRef.current.y < height * 0.32) {
              handlePause();
              return;
            }

            const now = Date.now();
            if (now - lastTapTimeRef.current < 280) {
              // Rapid Double-Tap fires tactical blaster!
              gameLoopRef.current?.requestFireBlaster();
              lastTapTimeRef.current = 0;
              return;
            }
            lastTapTimeRef.current = now;

            if (touchStartPosRef.current.x < width * 0.42) {
              gameLoopRef.current?.requestLaneLeft();
            } else if (touchStartPosRef.current.x > width * 0.58) {
              gameLoopRef.current?.requestLaneRight();
            } else {
              gameLoopRef.current?.requestJump();
            }
          } else {
            // Quick flick gestures
            if (gestureState.dy < -35 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
              gameLoopRef.current?.requestJump();
            } else if (gestureState.dx < -20) {
              gameLoopRef.current?.requestLaneLeft();
            } else if (gestureState.dx > 20) {
              gameLoopRef.current?.requestLaneRight();
            }
          }
        }
      },
      onPanResponderTerminate: () => {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        gameLoopRef.current?.setBoosting(false);
        hasBoostedRef.current = false;
      },
    })
  ).current;

  const showVirtualControls =
    settings.controlScheme === 'buttons' || settings.controlScheme === 'hybrid';

  return (
    <View style={styles.container}>
      {/* Interactive WebGL Surface with Touch Gestures */}
      <View style={styles.glContainer} {...panResponder.panHandlers}>
        <GLView style={styles.glView} onContextCreate={onContextCreate} />
      </View>

      {/* Head-Up Display (Score, distance, pilot callsign, stage progress, ammo, pause button) */}
      <GameHud
        state={uiState}
        gamerTag={gamerTag}
        onPause={handlePause}
        onFire={() => gameLoopRef.current?.requestFireBlaster()}
      />

      {/* Fast Alert at Run Start: Moving to Up to Jump & Hold to Boost */}
      {showStartAlert && uiState.status === GameStatus.RUNNING && (
        <FastStartAlert
          visible={showStartAlert}
          onDismiss={() => setShowStartAlert(false)}
        />
      )}

      {/* Tactile Virtual On-Screen Controls */}
      {showVirtualControls && uiState.status === GameStatus.RUNNING && (
        <VirtualControls
          onLeft={() => gameLoopRef.current?.requestLaneLeft()}
          onRight={() => gameLoopRef.current?.requestLaneRight()}
        />
      )}

      {/* Stage Cleared Celebration Modal */}
      {stageClearedInfo && (
        <StageClearedModal
          stage={stageClearedInfo.stage}
          score={uiState.score}
          distanceMeters={uiState.distanceMeters}
          maxCombo={uiState.maxCombo}
          creditsBonus={100}
          onNextLevel={handleNextLevel}
        />
      )}

      {/* Paused Overlay */}
      {!stageClearedInfo && uiState.status === GameStatus.PAUSED && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onMenu={onReturnToMenu}
        />
      )}

      {/* Game Over Screen */}
      {uiState.status === GameStatus.GAME_OVER && (
        <GameOverModal
          state={uiState}
          isNewBest={isNewBest}
          bestScore={bestScore}
          gamerTag={gamerTag}
          creditsEarned={creditsEarned}
          onRestart={handleRestart}
          onMenu={onReturnToMenu}
          onClaimShareReward={onClaimShareReward}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glContainer: {
    ...StyleSheet.absoluteFill,
  },
  glView: {
    flex: 1,
  },
});
