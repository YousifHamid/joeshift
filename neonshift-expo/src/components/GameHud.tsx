import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';
import { GameUiState } from '../game/GameUiState';
import { DifficultyTierLabels } from '../game/GameStatus';
import { PowerUpDisplayNames, PowerUpType } from '../game/PowerUp';

interface GameHudProps {
  state: GameUiState;
  gamerTag?: string;
  onPause: () => void;
  onFire?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  state,
  gamerTag = 'PILOT',
  onPause,
  onFire,
}) => {
  const tierLabel = DifficultyTierLabels[state.tier] || 'GRID ZERO';

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Header Row: Score (Left), Captain Name (Center), Pause Button (Right) */}
      <View style={styles.topRow}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{state.score.toLocaleString()}</Text>
          <Text style={styles.scoreLabel}>POINTS</Text>
        </View>

        {/* Prominent Captain / Pilot Callsign Badge Centered at Top */}
        <View style={styles.captainBadge}>
          <Text style={styles.captainLabel}>COMMANDER</Text>
          <Text style={styles.captainName} numberOfLines={1}>
            {gamerTag ? gamerTag.toUpperCase() : 'PILOT'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.pauseButton}
          onPress={onPause}
          activeOpacity={0.75}
          hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
        >
          <View style={styles.pauseIconWrap}>
            <View style={styles.pauseIconBar} />
            <View style={styles.pauseIconBar} />
          </View>
          <Text style={styles.pauseButtonText}>PAUSE</Text>
        </TouchableOpacity>
      </View>

      {/* Stage Progression Bar & Metrics */}
      <View style={styles.stageRow}>
        <View style={styles.stagePill}>
          <Text style={styles.stageText}>STAGE {state.currentStage} / 100</Text>
        </View>
        <View style={styles.stageBarTrack}>
          <View
            style={[
              styles.stageBarFill,
              { width: `${Math.min(100, Math.max(0, state.stageProgressPct * 100))}%` },
            ]}
          />
        </View>
        <Text style={styles.stageTargetText}>
          {state.distanceMeters}m / {state.stageTargetMeters}m
        </Text>
      </View>

      {/* Sub-header: Distance, Combo, Boost, Tier, Blaster Ammo */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{state.distanceMeters}m</Text>
        </View>

        {state.comboMultiplier > 1.0 && (
          <View style={[styles.statPill, styles.comboPill]}>
            <Text style={styles.comboText}>x{state.comboMultiplier.toFixed(1)} COMBO</Text>
          </View>
        )}

        {state.isBoosting && (
          <View style={[styles.statPill, styles.boostPill]}>
            <Text style={styles.boostText}>NITRO</Text>
          </View>
        )}

        <View style={[styles.statPill, styles.tierPill]}>
          <Text style={styles.tierText}>{tierLabel}</Text>
        </View>

        {/* Tactical Plasma Blaster Ammo Pill & Trigger */}
        {onFire && (
          <TouchableOpacity
            style={[
              styles.firePill,
              state.ammo <= 0 && styles.firePillEmpty,
            ]}
            onPress={onFire}
            activeOpacity={0.7}
            disabled={state.ammo <= 0}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.fireIcon}>▲</Text>
            <Text style={styles.fireLabel}>BLASTER</Text>
            <View style={styles.ammoBadge}>
              <Text style={styles.ammoText}>{state.ammo}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Power-ups Bar with Exact Countdown Seconds */}
      {state.activePowerUps.length > 0 && (
        <View style={styles.powerUpsRow}>
          {state.activePowerUps.map((type) => {
            const timer = state.activePowerUpTimers[type];
            const pct = timer ? Math.max(0, timer.remaining / timer.total) : 1;
            const remainingSec = timer ? timer.remaining.toFixed(1) : '0.0';
            const name = PowerUpDisplayNames[type] || type;

            let badgeColor = Colors.neonMagenta;
            if (type === PowerUpType.PHASE_SHIELD) badgeColor = Colors.neonCyan;
            if (type === PowerUpType.OVERDRIVE) badgeColor = Colors.neonGold;
            if (type === PowerUpType.ENERGY_MAGNET) badgeColor = Colors.neonGreen;

            return (
              <View key={type} style={[styles.powerUpBadge, { borderColor: badgeColor }]}>
                <View
                  style={[
                    styles.powerUpFill,
                    { width: `${pct * 100}%`, backgroundColor: badgeColor },
                  ]}
                />
                <Text style={styles.powerUpText}>
                  {name} <Text style={styles.powerUpTimerText}>{remainingSec}s</Text>
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Stage Cleared Celebration Notification */}
      {state.stageCelebrationText && (
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationText}>★ {state.stageCelebrationText} ★</Text>
          <Text style={styles.celebrationSubText}>+2 AMMO REFILL · +500 PTS BONUS</Text>
        </View>
      )}

      {/* Grid Shift Warning Alert */}
      {state.gridShiftWarning && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠ GRID SHIFT INCOMING</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: 14,
    right: 14,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'column',
  },
  scoreText: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: '900',
    color: Colors.neonCyan,
    textShadowColor: 'rgba(0, 245, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1.5,
  },
  scoreLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginTop: -3,
  },
  captainBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 14, 30, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    maxWidth: 150,
  },
  captainLabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 1.5,
  },
  captainName: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 16, 36, 0.85)',
    borderWidth: 1.5,
    borderColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  pauseIconWrap: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  pauseIconBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
    backgroundColor: Colors.neonCyan,
  },
  pauseButtonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 1,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    backgroundColor: 'rgba(8, 10, 22, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  stagePill: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stageText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 0.5,
  },
  stageBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  stageBarFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 3,
  },
  stageTargetText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
    flexWrap: 'wrap',
  },
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(16, 16, 36, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  comboPill: {
    backgroundColor: 'rgba(255, 0, 229, 0.2)',
    borderColor: Colors.neonMagenta,
  },
  comboText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: Colors.neonMagenta,
  },
  boostPill: {
    backgroundColor: 'rgba(0, 245, 255, 0.25)',
    borderColor: Colors.neonCyan,
  },
  boostText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: Colors.neonCyan,
  },
  tierPill: {
    borderColor: Colors.neonPurple,
    backgroundColor: 'rgba(123, 47, 255, 0.25)',
  },
  tierText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neonCyan,
  },
  firePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 68, 0, 0.25)',
    borderWidth: 1.5,
    borderColor: '#ff5500',
    shadowColor: '#ff5500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  firePillEmpty: {
    opacity: 0.4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  fireIcon: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '900',
    color: '#ffaa00',
  },
  fireLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
    color: '#ffaa00',
    letterSpacing: 0.5,
  },
  ammoBadge: {
    backgroundColor: '#ff3300',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  ammoText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  powerUpsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  powerUpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(6, 6, 15, 0.85)',
    overflow: 'hidden',
    position: 'relative',
  },
  powerUpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.25,
  },
  powerUpText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  powerUpTimerText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
    color: '#00ffff',
  },
  celebrationContainer: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.25)',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.neonCyan,
    alignItems: 'center',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  celebrationText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  celebrationSubText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: Colors.neonGold,
    letterSpacing: 1,
    marginTop: 2,
  },
  warningContainer: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 41, 101, 0.3)',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.dangerRed,
  },
  warningText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: Colors.dangerRed,
    letterSpacing: 1.5,
    textShadowColor: Colors.dangerRed,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
