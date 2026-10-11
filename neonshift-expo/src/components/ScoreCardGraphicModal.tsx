import React, { useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { GameUiState } from '../game/GameUiState';
import { VEHICLE_SKINS, DEFAULT_SKIN_ID } from '../game/VehicleSkins';
import { HapticsManager } from '../audio/HapticsManager';
import { SoundEffects } from '../audio/SoundEffects';

interface ScoreCardGraphicModalProps {
  visible: boolean;
  state: GameUiState;
  bestScore: number;
  gamerTag: string;
  onClaimReward?: () => Promise<void>;
  onClose: () => void;
}

export const ScoreCardGraphicModal: React.FC<ScoreCardGraphicModalProps> = ({
  visible,
  state,
  bestScore,
  gamerTag,
  onClaimReward,
  onClose,
}) => {
  const [copiedNotice, setCopiedNotice] = useState(false);
  const activeSkin = VEHICLE_SKINS[state.equippedSkin] || VEHICLE_SKINS[DEFAULT_SKIN_ID];

  const shareText = `🚀 Can you beat my high score in JOESHIFT?\n\n` +
    `⚡ SCORE: ${state.score.toLocaleString()} PTS\n` +
    `📍 DISTANCE: ${state.distanceMeters}m (Stage ${state.currentStage})\n` +
    `🔥 MAX COMBO: x${state.maxCombo.toFixed(1)}\n` +
    `🛸 PILOT: ${gamerTag} [Craft: ${activeSkin.name}]\n\n` +
    `Can you survive the hypersonic neon grid? Play now: https://joeshift.game/join\n\n` +
    `#JOESHIFT #BeatMyScore #CyberRunner #IndieGame`;

  const handleShareTwitter = async () => {
    try {
      HapticsManager.collect();
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      const supported = await Linking.canOpenURL(twitterUrl);
      if (supported) {
        await Linking.openURL(twitterUrl);
      } else {
        await Share.share({
          title: 'JOESHIFT — Beat My Score',
          message: shareText,
        });
      }
      if (onClaimReward) await onClaimReward();
      SoundEffects.playStageClear();
    } catch {
      await Share.share({ title: 'JOESHIFT — Beat My Score', message: shareText });
      if (onClaimReward) await onClaimReward();
    }
  };

  const handleShareInstagram = async () => {
    try {
      HapticsManager.collect();
      // Try opening Instagram camera or app, or native share sheet
      const instagramUrl = 'instagram://app';
      const canOpen = await Linking.canOpenURL(instagramUrl);
      if (canOpen) {
        await Linking.openURL(instagramUrl);
      } else {
        await Share.share({
          title: 'JOESHIFT — Beat My Score',
          message: shareText,
        });
      }
      if (onClaimReward) await onClaimReward();
      SoundEffects.playStageClear();
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3500);
    } catch {
      await Share.share({ title: 'JOESHIFT — Beat My Score', message: shareText });
      if (onClaimReward) await onClaimReward();
    }
  };

  const handleSystemShare = async () => {
    try {
      HapticsManager.collect();
      const res = await Share.share({
        title: 'JOESHIFT — Beat My Score',
        message: shareText,
      });
      if (onClaimReward && (res.action === Share.sharedAction || res.action === Share.dismissedAction)) {
        await onClaimReward();
        SoundEffects.playStageClear();
      }
    } catch {}
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>OFFICIAL FLIGHT LOG</Text>
              <Text style={styles.modalSubtitle}>SHARE SCORE GRAPHIC CARD</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {copiedNotice && (
            <View style={styles.copiedBanner}>
              <Text style={styles.copiedBannerText}>
                ✨ SCORE CARD COPIED! READY TO POST ON STORIES / FEED
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* THE VISUALLY STRIKING GRAPHIC SCORE CARD */}
            <View style={[styles.graphicCard, { borderColor: activeSkin.accentHex }]}>
              {/* Corner Tech Accents */}
              <View style={[styles.cornerTL, { borderColor: activeSkin.accentHex }]} />
              <View style={[styles.cornerTR, { borderColor: activeSkin.accentHex }]} />
              <View style={[styles.cornerBL, { borderColor: activeSkin.accentHex }]} />
              <View style={[styles.cornerBR, { borderColor: activeSkin.accentHex }]} />

              {/* Card Top Brand Line */}
              <View style={styles.cardBrandRow}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandTitle}>JOESHIFT</Text>
                  <Text style={styles.brandSubtitle}>CYBER RUNNER</Text>
                </View>

                <View style={[styles.skinPill, { borderColor: activeSkin.accentHex }]}>
                  <Text style={styles.skinPillText}>🛸 {activeSkin.name}</Text>
                </View>
              </View>

              {/* Pilot Info Bar */}
              <View style={styles.pilotBar}>
                <Text style={styles.pilotLabel}>PILOT CALLSIGN:</Text>
                <Text style={styles.pilotTag}>{gamerTag}</Text>
              </View>

              {/* Huge Score Hero Box */}
              <View style={styles.scoreHeroBox}>
                <Text style={styles.scoreHeroLabel}>FLIGHT RECORD POINTS</Text>
                <Text style={styles.scoreHeroNumber}>{state.score.toLocaleString()}</Text>
                <Text style={styles.scoreHeroSub}>PTS CLEARED</Text>
              </View>

              {/* Core Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCell}>
                  <Text style={styles.metricCellLabel}>DISTANCE</Text>
                  <Text style={styles.metricCellVal}>{state.distanceMeters}m</Text>
                </View>

                <View style={styles.metricCell}>
                  <Text style={styles.metricCellLabel}>STAGE</Text>
                  <Text style={[styles.metricCellVal, { color: Colors.neonGold }]}>
                    LVL {state.currentStage}
                  </Text>
                </View>

                <View style={styles.metricCell}>
                  <Text style={styles.metricCellLabel}>MAX COMBO</Text>
                  <Text style={[styles.metricCellVal, { color: Colors.neonMagenta }]}>
                    x{state.maxCombo.toFixed(1)}
                  </Text>
                </View>

                <View style={styles.metricCell}>
                  <Text style={styles.metricCellLabel}>SHARDS</Text>
                  <Text style={[styles.metricCellVal, { color: Colors.neonCyan }]}>
                    {state.shardsCollected}
                  </Text>
                </View>
              </View>

              {/* Challenge Banner */}
              <View style={styles.challengeBox}>
                <Text style={styles.challengeTitle}>🔥 BEAT MY FLIGHT RECORD 🔥</Text>
                <Text style={styles.challengeLink}>PLAY AT: joeshift.game/join</Text>
              </View>

              {/* Card Footer Social Tags */}
              <View style={styles.cardFooter}>
                <Text style={styles.hashtagText}>
                  #JOESHIFT #BeatMyScore #CyberRunner #HighOctane
                </Text>
              </View>
            </View>

            {/* Quick Share Buttons Section */}
            <View style={styles.shareButtonsContainer}>
              <Text style={styles.shareActionHeader}>// EXPORT & POST CARD</Text>

              {/* Share to X (Twitter) */}
              <TouchableOpacity
                style={[styles.socialBtn, styles.twitterBtn]}
                onPress={handleShareTwitter}
                activeOpacity={0.8}
              >
                <Text style={styles.socialBtnIcon}>𝕏</Text>
                <Text style={styles.socialBtnText}>POST TO X (TWITTER)</Text>
              </TouchableOpacity>

              {/* Share to Instagram */}
              <TouchableOpacity
                style={[styles.socialBtn, styles.instagramBtn]}
                onPress={handleShareInstagram}
                activeOpacity={0.8}
              >
                <Text style={styles.socialBtnIcon}>📸</Text>
                <Text style={styles.socialBtnText}>SHARE TO INSTAGRAM</Text>
              </TouchableOpacity>

              {/* System Share (WhatsApp, Messages, Telegram, etc.) */}
              <TouchableOpacity
                style={[styles.socialBtn, styles.systemBtn]}
                onPress={handleSystemShare}
                activeOpacity={0.8}
              >
                <Text style={styles.socialBtnIcon}>⎘</Text>
                <Text style={styles.socialBtnText}>SHARE VIA MESSAGES / OTHER APPS</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 4, 14, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 120,
  },
  container: {
    width: '94%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: 'rgba(12, 14, 32, 0.98)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    padding: 18,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.3)',
    paddingBottom: 8,
  },
  modalTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  modalSubtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 2,
    opacity: 0.85,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  copiedBanner: {
    backgroundColor: 'rgba(0, 240, 255, 0.25)',
    borderColor: Colors.neonCyan,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  copiedBannerText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  graphicCard: {
    position: 'relative',
    backgroundColor: 'rgba(6, 8, 24, 0.95)',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  cornerTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  cardBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandBadge: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 3,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  brandSubtitle: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    fontWeight: 'bold',
    color: Colors.neonMagenta,
    letterSpacing: 1.5,
  },
  skinPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skinPillText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pilotBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(123, 47, 255, 0.2)',
    borderColor: 'rgba(123, 47, 255, 0.4)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  pilotLabel: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  pilotTag: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 1,
  },
  scoreHeroBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    paddingVertical: 14,
    marginBottom: 12,
  },
  scoreHeroLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    opacity: 0.85,
  },
  scoreHeroNumber: {
    fontFamily: 'monospace',
    fontSize: 44,
    fontWeight: '900',
    color: Colors.neonGold,
    letterSpacing: 2,
    textShadowColor: Colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
    marginVertical: 2,
  },
  scoreHeroSub: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  metricCell: {
    flex: 1,
    backgroundColor: 'rgba(16, 18, 40, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  metricCellLabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricCellVal: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  challengeBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: Colors.neonGold,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  challengeLink: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: Colors.neonGold,
    letterSpacing: 1,
    marginTop: 2,
    fontWeight: 'bold',
  },
  cardFooter: {
    alignItems: 'center',
  },
  hashtagText: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    color: '#FFFFFF',
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  shareButtonsContainer: {
    width: '100%',
    gap: 8,
  },
  shareActionHeader: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 2,
    opacity: 0.85,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  socialBtnIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  socialBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  twitterBtn: {
    backgroundColor: '#000000',
    borderColor: '#1DA1F2',
    borderWidth: 1.5,
    shadowColor: '#1DA1F2',
  },
  instagramBtn: {
    backgroundColor: '#833AB4',
    borderColor: '#FD1D1D',
    borderWidth: 1.5,
    shadowColor: '#E1306C',
  },
  systemBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: Colors.neonCyan,
    borderWidth: 1.5,
    shadowColor: Colors.neonCyan,
  },
});
