import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';
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

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Top Glossy Pill Badge (Inspired by reference Level Badge) */}
        <View style={styles.topPill}>
          <Text style={styles.topPillText}>STAGE {stage} CLEARED</Text>
        </View>

        {/* Hero Showcase (Trophy + Stage Score) */}
        <View style={styles.heroBox}>
          <View style={styles.trophyCircle}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          <Text style={styles.scoreVal}>{score.toLocaleString()}</Text>
          <Text style={styles.scoreLabel}>TOTAL POINTS</Text>
        </View>

        {/* Quick Stats Pill Row */}
        <View style={styles.statsPillRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>DISTANCE</Text>
            <Text style={styles.statPillVal}>{distanceMeters}m</Text>
          </View>
          <View style={styles.statPillDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>PEAK COMBO</Text>
            <Text style={[styles.statPillVal, { color: Colors.neonMagenta }]}>
              x{maxCombo.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Reward Tokens (Clean 3-item capsule row matching reference) */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>REWARDS</Text>
          <View style={styles.rewardTokensRow}>
            {/* Cyber Credits */}
            <View style={styles.rewardToken}>
              <Text style={styles.tokenIcon}>⚡</Text>
              <Text style={styles.tokenVal}>+{creditsBonus}</Text>
              <Text style={styles.tokenSub}>CREDITS</Text>
            </View>

            {/* Plasma Ammo */}
            <View style={styles.rewardToken}>
              <Text style={styles.tokenIcon}>💥</Text>
              <Text style={styles.tokenVal}>+2</Text>
              <Text style={styles.tokenSub}>AMMO</Text>
            </View>

            {/* Clear Bonus */}
            <View style={styles.rewardToken}>
              <Text style={styles.tokenIcon}>⭐</Text>
              <Text style={styles.tokenVal}>+500</Text>
              <Text style={styles.tokenSub}>BONUS</Text>
            </View>
          </View>
        </View>

        {/* Next Stage Teaser Pill */}
        <View style={styles.nextTeaserPill}>
          <Text style={styles.nextTeaserLabel}>NEXT OBJECTIVE:</Text>
          <Text style={styles.nextTeaserVal}>
            STAGE {nextStage} ({nextStageInfo.stageTargetMeters.toLocaleString()}m)
          </Text>
        </View>

        {/* Big Juicy CTA Button (Inspired by reference PLAY button) */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={onNextLevel}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnText}>NEXT LEVEL ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 6, 20, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
  },
  card: {
    width: '88%',
    maxWidth: 350,
    backgroundColor: 'rgba(22, 20, 52, 0.98)',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  topPill: {
    position: 'absolute',
    top: -18,
    backgroundColor: Colors.neonGold,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#B8860B',
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  topPillText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: '#0A0A1A',
    letterSpacing: 1.5,
  },
  heroBox: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  trophyCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.neonGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  trophyIcon: {
    fontSize: 30,
  },
  scoreVal: {
    fontFamily: 'monospace',
    fontSize: 34,
    fontWeight: '900',
    color: Colors.neonGold,
    letterSpacing: 1.5,
    textShadowColor: Colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scoreLabel: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.75,
    letterSpacing: 1.5,
    marginTop: 1,
  },
  statsPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(10, 10, 28, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  statPill: {
    alignItems: 'center',
    flex: 1,
  },
  statPillDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statPillLabel: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statPillVal: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: Colors.neonCyan,
  },
  rewardsSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.75,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  rewardTokensRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    justifyContent: 'space-between',
  },
  rewardToken: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tokenIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tokenVal: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tokenSub: {
    fontFamily: 'monospace',
    fontSize: 7.5,
    fontWeight: 'bold',
    color: Colors.neonGold,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  nextTeaserPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: 'rgba(0, 240, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 16,
  },
  nextTeaserLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  nextTeaserVal: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
    color: Colors.neonCyan,
  },
  playBtn: {
    width: '100%',
    backgroundColor: Colors.neonGold,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#B8860B',
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  playBtnText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 2,
  },
});
