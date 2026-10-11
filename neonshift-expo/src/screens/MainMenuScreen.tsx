import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';

interface MainMenuScreenProps {
  bestScore: number;
  bestDistance: number;
  gamerTag: string;
  credits: number;
  hasHeadstartNitro: boolean;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenHangar: () => void;
  onOpenRewards: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  bestScore,
  bestDistance,
  gamerTag,
  credits,
  hasHeadstartNitro,
  onStartGame,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenHangar,
  onOpenRewards,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleShareGame = async () => {
    try {
      await Share.share({
        title: 'JOESHIFT — Cyber Runner',
        message: `⚡ Play JOESHIFT: Shift. Jump. Survive! High-octane cyber neon runner. My best score: ${bestScore.toLocaleString()} pts (${bestDistance}m)! Join here to claim +250 Credits: https://joeshift.game/join`,
      });
    } catch {
      // Safe fallback
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Cyber Grid Lines */}
      <View style={styles.bgGridOverlay} pointerEvents="none" />

      {/* Top Pilot Bar */}
      <View style={styles.topBar}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagBadgeText}>PILOT: {gamerTag}</Text>
        </View>

        <TouchableOpacity
          style={styles.creditsChip}
          onPress={onOpenRewards}
          activeOpacity={0.8}
        >
          <Text style={styles.creditsChipText}>⚡ {credits.toLocaleString()} CR</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Header */}
      <View style={styles.heroSection}>
        <Text style={styles.title}>JOESHIFT</Text>
        <Text style={styles.tagline}>SHIFT · JUMP · SURVIVE</Text>

        <View style={styles.recordBadge}>
          <Text style={styles.recordLabel}>PERSONAL BEST</Text>
          <Text style={styles.recordScore}>{bestScore.toLocaleString()} PTS</Text>
          <Text style={styles.recordDist}>{bestDistance} METERS CLEARED</Text>
        </View>
      </View>

      {/* Primary Action Button */}
      <View style={styles.actionSection}>
        {hasHeadstartNitro && (
          <View style={styles.nitroBadge}>
            <Text style={styles.nitroBadgeText}>🚀 NITRO HEADSTART ARMED (4.0s BOOST)</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.playButton}
          onPress={onStartGame}
          activeOpacity={0.8}
        >
          <Text style={styles.playButtonText}>INITIATE RUN</Text>
        </TouchableOpacity>

        {/* Action Grid Row 1: Leaderboard & Hangar */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onOpenLeaderboard}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>LEADERBOARD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, styles.hangarBtn]}
            onPress={onOpenHangar}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryBtnText, { color: Colors.neonCyan }]}>🛸 HANGAR</Text>
          </TouchableOpacity>
        </View>

        {/* Action Grid Row 2: Briefing & Settings */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowHowToPlay(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>BRIEFING</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>SETTINGS</Text>
          </TouchableOpacity>
        </View>

        {/* Rewards & Invite / Share Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.shareBtn, styles.rewardShareBtn]}
            onPress={onOpenRewards}
            activeOpacity={0.7}
          >
            <Text style={styles.rewardShareBtnText}>🎁 INVITE & GET REWARDS (+250 CR)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtnMini}
            onPress={handleShareGame}
            activeOpacity={0.7}
          >
            <Text style={styles.shareBtnText}>⎘ SHARE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Briefing / How To Play Modal */}
      <Modal visible={showHowToPlay} transparent animationType="fade" onRequestClose={() => setShowHowToPlay(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.briefingCard}>
            <Text style={styles.briefingTitle}>TACTICAL BRIEFING</Text>

            <ScrollView style={styles.briefingScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.briefingSection}>
                <Text style={styles.sectionHeader}>// FLIGHT CONTROLS & ARSENAL</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>SLIDE / SWIPE LEFT OR RIGHT</Text> — Effortlessly change lanes at any speed.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>SWIPE UP</Text> — Jump over ground obstacles.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>HOLD SCREEN (LONG PRESS)</Text> — Continuous touch engages Nitro Boost (+60% speed)!</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>DOUBLE-TAP OR 💥 BLASTER</Text> — Fire plasma cannon bolts to blast obstacles!</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>TAP UPPER SCREEN</Text> — Instant simulation pause.</Text>
              </View>

              <View style={styles.briefingSection}>
                <Text style={styles.sectionHeader}>// 100 PROGRESSIVE STAGES</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>STAGE 1</Text>: 1000m target threshold.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>STAGE 2</Text>: 1500m target threshold (2500m cumulative).</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>STAGE 3</Text>: 1800m target threshold (4300m cumulative).</Text>
                <Text style={styles.bulletPoint}>• Clearing each stage refills +2 Ammo and awards +500 PTS!</Text>
              </View>

              <View style={styles.briefingSection}>
                <Text style={styles.sectionHeader}>// HAZARDS & COUNTERMEASURES</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.hazardName}>GROUND BARRIER</Text>: Red cyber barricade. Jump or BLAST with cannon!</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.hazardName}>HORIZONTAL LASER</Text>: High voltage energy beam. Jump to dodge.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.hazardName}>VOID GAP</Text>: Abyss in the grid floor. Airborne required!</Text>
              </View>

              <View style={styles.briefingSection}>
                <Text style={styles.sectionHeader}>// POWER-UPS & MULTIPLIERS</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.cyanItem}>PHASE SHIELD</Text>: Absorbs 1 fatal collision.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.purpleItem}>CHRONO WARP</Text>: Slows world speed by 45%.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.goldItem}>2X OVERDRIVE</Text>: Doubles all score generation.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.greenItem}>ENERGY MAGNET</Text>: Pulls shards from all lanes.</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>NEAR MISSES (+25)</Text>: Skimming past obstacles multiplies combo!</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeBriefingBtn} onPress={() => setShowHowToPlay(false)}>
              <Text style={styles.closeBriefingText}>CONFIRMED</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  bgGridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  creditsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.18)',
    borderWidth: 1,
    borderColor: Colors.neonGold,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  creditsChipText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: Colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  heroSection: {
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(123, 47, 255, 0.25)',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  tagBadgeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
    color: Colors.neonCyan,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 48,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 245, 255, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  tagline: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '800',
    color: Colors.neonMagenta,
    letterSpacing: 3,
    marginTop: 6,
    textShadowColor: Colors.neonMagenta,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  recordBadge: {
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 16, 36, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  recordLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  recordScore: {
    fontFamily: 'monospace',
    fontSize: 26,
    fontWeight: '900',
    color: Colors.neonGold,
    letterSpacing: 1,
  },
  recordDist: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  nitroBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.neonCyan,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  nitroBadgeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  playButton: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 8,
  },
  playButtonText: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    maxWidth: 320,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  hangarBtn: {
    borderColor: 'rgba(0, 240, 255, 0.4)',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  shareBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 245, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.4)',
    alignItems: 'center',
  },
  shareBtnMini: {
    flex: 0.9,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 245, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.4)',
    alignItems: 'center',
  },
  rewardShareBtn: {
    flex: 1.8,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: Colors.neonGold,
  },
  rewardShareBtnText: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  shareBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 15, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  briefingCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    borderRadius: 16,
    backgroundColor: 'rgba(16, 16, 36, 0.98)',
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    padding: 20,
  },
  briefingTitle: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  briefingScroll: {
    maxHeight: 400,
  },
  briefingSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  bulletPoint: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 6,
  },
  highlight: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  hazardName: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  cyanItem: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  purpleItem: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  goldItem: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  greenItem: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  closeBriefingBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
  },
  closeBriefingText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});
