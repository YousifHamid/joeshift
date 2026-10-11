import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { DifficultyManager } from '../game/DifficultyManager';
import { DifficultyTierLabels } from '../game/GameStatus';
import { StageManager } from '../game/StageManager';

interface StageClearedModalProps {
  stage: number;
  score: number;
  distanceMeters: number;
  maxCombo: number;
  creditsBonus: number;
  onNextLevel: () => void;
}

export const StageClearedModal: React.FC<StageClearedModalProps> = ({
  stage,
  score,
  distanceMeters,
  maxCombo,
  creditsBonus,
  onNextLevel,
}) => {
  const nextStage = stage + 1;
  const nextStageInfo = StageManager.getStageInfo(distanceMeters + 1);
  const nextTier = DifficultyManager.tierFor(nextStageInfo.stageTargetMeters);
  const nextTierLabel = DifficultyTierLabels[nextTier] || 'GRID ZERO';

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Top Trophy Banner with Celebration Sparks */}
        <View style={styles.trophyWrapper}>
          <Text style={styles.sparkleIcon}>✨</Text>
          <View style={styles.trophyRing}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          <Text style={styles.sparkleIcon}>✨</Text>
        </View>

        {/* Level Complete Headline */}
        <Text style={styles.stageTitle}>STAGE {stage} COMPLETED!</Text>
        <Text style={styles.stageSubtitle}>SECTOR CLEARED · HYPER-GRID CONQUERED</Text>

        {/* Run Telemetry Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>DISTANCE</Text>
            <Text style={styles.statVal}>{distanceMeters}m</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TOTAL SCORE</Text>
            <Text style={[styles.statVal, { color: Colors.neonGold }]}>
              {score.toLocaleString()}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PEAK COMBO</Text>
            <Text style={[styles.statVal, { color: Colors.neonMagenta }]}>
              x{maxCombo.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Level Clear Rewards Awarded */}
        <View style={styles.rewardsSection}>
          <Text style={styles.rewardsHeader}>// REWARDS SECURED</Text>

          <View style={styles.rewardPill}>
            <Text style={styles.rewardIcon}>⚡</Text>
            <Text style={styles.rewardText}>+{creditsBonus} CYBER CREDITS (VAULT ADDED)</Text>
          </View>

          <View style={styles.rewardPill}>
            <Text style={styles.rewardIcon}>💥</Text>
            <Text style={styles.rewardText}>+2 PLASMA CANNON AMMO REFILLED</Text>
          </View>

          <View style={styles.rewardPill}>
            <Text style={styles.rewardIcon}>⭐</Text>
            <Text style={styles.rewardText}>+500 PTS SECTOR CLEAR BONUS</Text>
          </View>
        </View>

        {/* Next Level Target Briefing */}
        <View style={styles.nextStageBox}>
          <View style={styles.nextStageHeaderRow}>
            <Text style={styles.nextStageLabel}>NEXT OBJECTIVE</Text>
            <Text style={styles.tierBadge}>{nextTierLabel}</Text>
          </View>
          <Text style={styles.nextStageTitle}>STAGE {nextStage}</Text>
          <Text style={styles.nextStageDesc}>
            Target: {nextStageInfo.stageTargetMeters.toLocaleString()}m threshold
          </Text>
        </View>

        {/* Primary Action Button: NEXT LEVEL */}
        <TouchableOpacity
          style={styles.nextLevelButton}
          onPress={onNextLevel}
          activeOpacity={0.8}
        >
          <Text style={styles.nextLevelText}>NEXT LEVEL ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 4, 14, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(12, 14, 32, 0.98)',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.neonGold,
    padding: 22,
    alignItems: 'center',
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
  },
  trophyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  trophyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: Colors.neonGold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },
  trophyIcon: {
    fontSize: 34,
  },
  sparkleIcon: {
    fontSize: 20,
  },
  stageTitle: {
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: Colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginTop: 4,
  },
  stageSubtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    opacity: 0.85,
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 18, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.75,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statVal: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 0.5,
  },
  rewardsSection: {
    width: '100%',
    marginBottom: 16,
  },
  rewardsHeader: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
    opacity: 0.85,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 6,
    gap: 8,
  },
  rewardIcon: {
    fontSize: 14,
  },
  rewardText: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nextStageBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  nextStageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextStageLabel: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    opacity: 0.85,
  },
  tierBadge: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.neonCyan,
    borderWidth: 1,
    borderColor: Colors.neonCyan,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  nextStageTitle: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  nextStageDesc: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  nextLevelButton: {
    width: '100%',
    backgroundColor: Colors.neonGold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  nextLevelText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 2,
  },
});
