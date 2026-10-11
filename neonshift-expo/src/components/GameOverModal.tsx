import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Top Arch Pill Badge (Inspired by reference Level Badge) */}
        <View style={styles.topPill}>
          <Text style={styles.topPillText}>RUN TERMINATED</Text>
        </View>

        {/* Cause / Record Meta */}
        <View style={styles.metaRow}>
          {isNewBest ? (
            <View style={styles.newRecordBadge}>
              <Text style={styles.newRecordText}>★ NEW BEST RECORD ★</Text>
            </View>
          ) : state.gameOverCause ? (
            <Text style={styles.causeText}>
              FATAL IMPACT: {state.gameOverCause.toUpperCase()}
            </Text>
          ) : null}
        </View>

        {/* Hero Score Showcase */}
        <View style={styles.heroBox}>
          <Text style={styles.scoreNumber}>{state.score.toLocaleString()}</Text>
          <Text style={styles.scoreLabel}>TOTAL POINTS</Text>
          <Text style={styles.bestSubText}>
            BEST: {Math.max(bestScore, state.score).toLocaleString()} PTS
          </Text>
        </View>

        {/* Clean 3-Item Capsule Stat Bar (Matching reference app capsule style) */}
        <View style={styles.statCapsuleRow}>
          <View style={styles.statCapsule}>
            <Text style={styles.statCapsuleIcon}>DIST</Text>
            <Text style={styles.statCapsuleVal}>{state.distanceMeters}m</Text>
            <Text style={styles.statCapsuleLabel}>STAGE {state.currentStage}</Text>
          </View>

          <View style={styles.statCapsule}>
            <Text style={[styles.statCapsuleIcon, { color: Colors.neonGold }]}>CR</Text>
            <Text style={[styles.statCapsuleVal, { color: Colors.neonGold }]}>
              +{creditsEarned}
            </Text>
            <Text style={styles.statCapsuleLabel}>CREDITS</Text>
          </View>

          <View style={styles.statCapsule}>
            <Text style={[styles.statCapsuleIcon, { color: Colors.neonMagenta }]}>COMBO</Text>
            <Text style={[styles.statCapsuleVal, { color: Colors.neonMagenta }]}>
              x{state.maxCombo.toFixed(1)}
            </Text>
            <Text style={styles.statCapsuleLabel}>PEAK</Text>
          </View>
        </View>

        {/* Claimed Reward Notice if active */}
        {claimedReward && (
          <View style={styles.claimedPill}>
            <Text style={styles.claimedText}>
              [PERK ARMED] +500 CREDITS & NITRO BOOST READY FOR NEXT RUN!
            </Text>
          </View>
        )}

        {/* Action Button Section (Inspired by reference clean button layout) */}
        <View style={styles.buttonStack}>
          {/* Primary Big Juicy Button: RUN AGAIN */}
          <TouchableOpacity
            style={styles.primaryRunBtn}
            onPress={onRestart}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryRunBtnText}>RUN AGAIN ➔</Text>
          </TouchableOpacity>

          {/* Secondary Actions Row: BEAT MY SCORE & MENU */}
          <View style={styles.secondaryActionsRow}>
            {/* Beat My Score / Graphic Card Button */}
            <TouchableOpacity
              style={styles.beatScoreBtn}
              onPress={() => setShowGraphicCard(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.beatScoreBtnText}>
                {claimedReward ? 'SHARE SCORE' : 'BEAT MY SCORE (+500)'}
              </Text>
            </TouchableOpacity>

            {/* Menu Button */}
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={onMenu}
              activeOpacity={0.8}
            >
              <Text style={styles.menuBtnText}>MENU</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(6, 6, 20, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  card: {
    width: '88%',
    maxWidth: 350,
    backgroundColor: 'rgba(22, 20, 52, 0.98)',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 41, 101, 0.6)',
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: Colors.dangerRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  topPill: {
    position: 'absolute',
    top: -18,
    backgroundColor: Colors.dangerRed,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#A00030',
    shadowColor: Colors.dangerRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  topPillText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  metaRow: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  newRecordBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: Colors.neonGold,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  newRecordText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: Colors.neonGold,
    letterSpacing: 1,
  },
  causeText: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 1,
  },
  heroBox: {
    alignItems: 'center',
    marginVertical: 6,
  },
  scoreNumber: {
    fontFamily: 'monospace',
    fontSize: 44,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 1.5,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  scoreLabel: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 2,
    marginTop: -2,
  },
  bestSubText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.neonGold,
    letterSpacing: 1,
    marginTop: 4,
  },
  statCapsuleRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  statCapsule: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  statCapsuleIcon: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statCapsuleVal: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statCapsuleLabel: {
    fontFamily: 'monospace',
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  claimedPill: {
    backgroundColor: 'rgba(0, 240, 255, 0.18)',
    borderColor: Colors.neonCyan,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  claimedText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonStack: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  primaryRunBtn: {
    width: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#008B99',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryRunBtnText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 2,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  beatScoreBtn: {
    flex: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.16)',
    borderColor: Colors.neonGold,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beatScoreBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  menuBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
