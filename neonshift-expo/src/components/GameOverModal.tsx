import React from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';
import { GameUiState } from '../game/GameUiState';
import { ScoreCardGraphicModal } from './ScoreCardGraphicModal';

interface GameOverModalProps {
  state: GameUiState;
  isNewBest: boolean;
  bestScore: number;
  gamerTag?: string;
  creditsEarned?: number;
  onRestart: () => void;
  onMenu: () => void;
  onClaimShareReward?: () => Promise<void>;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  state,
  isNewBest,
  bestScore,
  gamerTag = 'PILOT',
  creditsEarned = 0,
  onRestart,
  onMenu,
  onClaimShareReward,
}) => {
  const [claimedReward, setClaimedReward] = React.useState(false);
  const [showGraphicCard, setShowGraphicCard] = React.useState(false);

  const handleShareScore = async () => {
    try {
      const result = await Share.share({
        title: 'JOESHIFT — Flight Record',
        message: `🚀 I survived ${state.distanceMeters}m with ${state.score.toLocaleString()} PTS in JOESHIFT! Max Combo: x${state.maxCombo.toFixed(1)}. Beat my record: https://joeshift.game/join`,
      });

      if (onClaimShareReward && (result.action === Share.sharedAction || result.action === Share.dismissedAction)) {
        await onClaimShareReward();
        setClaimedReward(true);
      }
    } catch {
      if (onClaimShareReward) {
        await onClaimShareReward();
        setClaimedReward(true);
      }
    }
  };
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.dangerHeader}>RUN TERMINATED</Text>

        {state.gameOverCause && (
          <View style={styles.causeBadge}>
            <Text style={styles.causeText}>
              FATAL IMPACT: {state.gameOverCause.toUpperCase()}
            </Text>
          </View>
        )}

        {isNewBest && (
          <View style={styles.newBestBanner}>
            <Text style={styles.newBestText}>★ NEW RECORD ACHIEVED ★</Text>
          </View>
        )}

        {/* Big Score Display */}
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreNumber}>{state.score.toLocaleString()}</Text>
          <Text style={styles.scoreLabel}>TOTAL POINTS</Text>
        </View>

        {/* Run Analytics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>DISTANCE</Text>
            <Text style={styles.statVal}>{state.distanceMeters}m</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SHARDS</Text>
            <Text style={[styles.statVal, { color: Colors.neonCyan }]}>
              {state.shardsCollected}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>NEAR MISSES</Text>
            <Text style={[styles.statVal, { color: Colors.neonGold }]}>
              {state.nearMisses}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MAX COMBO</Text>
            <Text style={[styles.statVal, { color: Colors.neonMagenta }]}>
              x{state.maxCombo.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Earned Cyber Credits Pill */}
        {creditsEarned > 0 && (
          <View style={styles.creditsRewardPill}>
            <Text style={styles.creditsRewardText}>
              ⚡ +{creditsEarned} CYBER CREDITS SECURED
            </Text>
          </View>
        )}

        {claimedReward && (
          <View style={styles.claimedPill}>
            <Text style={styles.claimedText}>
              🎉 +250 CREDITS & NITRO BOOST ARMED FOR NEXT RUN!
            </Text>
          </View>
        )}

        <Text style={styles.bestRecordText}>
          PERSONAL BEST: {Math.max(bestScore, state.score).toLocaleString()} PTS
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonStack}>
          <TouchableOpacity
            style={[styles.btn, styles.restartBtn]}
            onPress={onRestart}
            activeOpacity={0.8}
          >
            <Text style={styles.restartBtnText}>RUN AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.beatScoreGraphicBtn]}
            onPress={() => setShowGraphicCard(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.beatScoreGraphicBtnText}>
              ⚡ BEAT MY SCORE (GRAPHIC CARD)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.shareBtn]}
            onPress={handleShareScore}
            activeOpacity={0.8}
          >
            <Text style={styles.shareBtnText}>
              {claimedReward ? '⎘ QUICK SHARE' : '🎁 SHARE TO GET +250 CR & NITRO'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.menuBtn]}
            onPress={onMenu}
            activeOpacity={0.8}
          >
            <Text style={styles.menuBtnText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Visually Striking Graphic Card Modal for IG / X */}
      <ScoreCardGraphicModal
        visible={showGraphicCard}
        state={state}
        bestScore={bestScore}
        gamerTag={gamerTag}
        onClaimReward={onClaimShareReward ? async () => {
          await onClaimShareReward();
          setClaimedReward(true);
        } : undefined}
        onClose={() => setShowGraphicCard(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 6, 15, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  card: {
    width: '88%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 16, 36, 0.97)',
    borderWidth: 2,
    borderColor: Colors.dangerRed,
    alignItems: 'center',
    shadowColor: Colors.dangerRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  dangerHeader: {
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '900',
    color: Colors.dangerRed,
    letterSpacing: 2,
    textShadowColor: Colors.dangerRed,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  causeBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 41, 101, 0.2)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 41, 101, 0.5)',
  },
  causeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  newBestBanner: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.neonGold,
  },
  newBestText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: Colors.neonGold,
    letterSpacing: 1.5,
  },
  scoreBlock: {
    marginVertical: 14,
    alignItems: 'center',
  },
  scoreNumber: {
    fontFamily: 'monospace',
    fontSize: 48,
    fontWeight: '900',
    color: Colors.neonCyan,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 1,
  },
  scoreLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(6, 6, 15, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statVal: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bestRecordText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginVertical: 8,
  },
  creditsRewardPill: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: Colors.neonGold,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 4,
    alignItems: 'center',
    width: '100%',
  },
  creditsRewardText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  claimedPill: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: Colors.neonCyan,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 4,
    alignItems: 'center',
    width: '100%',
  },
  claimedText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  buttonStack: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartBtn: {
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  restartBtnText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 2,
  },
  menuBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuBtnText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  shareBtn: {
    backgroundColor: 'rgba(0, 245, 255, 0.12)',
    borderWidth: 1,
    borderColor: Colors.neonCyan,
  },
  shareBtnText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  beatScoreGraphicBtn: {
    backgroundColor: 'rgba(255, 215, 0, 0.18)',
    borderWidth: 1.5,
    borderColor: Colors.neonGold,
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  beatScoreGraphicBtnText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
