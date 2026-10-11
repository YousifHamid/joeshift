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
import { HapticsManager } from '../audio/HapticsManager';
import { SoundEffects } from '../audio/SoundEffects';

interface RewardModalProps {
  visible: boolean;
  credits: number;
  hasHeadstartNitro: boolean;
  isSolarGoldUnlocked: boolean;
  gamerTag: string;
  onClaimReward: () => Promise<void>;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  visible,
  credits,
  hasHeadstartNitro,
  isSolarGoldUnlocked,
  gamerTag,
  onClaimReward,
  onClose,
}) => {
  const [justClaimed, setJustClaimed] = useState(false);

  const handleShareAndClaim = async () => {
    try {
      HapticsManager.collect();
      const result = await Share.share({
        title: 'JOESHIFT — Cyber Runner Invite',
        message: `[JOESHIFT] Play JOESHIFT with me! Shift lanes, blast obstacles, and master the hypersonic neon grid!\n\nUse Pilot Callsign [${gamerTag}] or join here to claim +500 Cyber Credits and an exclusive Solar Phoenix interceptor:\nhttps://joeshift.game/join?ref=${gamerTag}`,
      });

      // Award the player when returning from share sheet
      if (result.action === Share.sharedAction || result.action === Share.dismissedAction) {
        await onClaimReward();
        setJustClaimed(true);
        HapticsManager.stageClear();
        SoundEffects.playStageClear();
        setTimeout(() => setJustClaimed(false), 4500);
      }
    } catch {
      // Still grant reward gracefully on platform test
      await onClaimReward();
      setJustClaimed(true);
      setTimeout(() => setJustClaimed(false), 4500);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>PILOT REWARD VAULT</Text>
              <Text style={styles.subtitle}>SHARE & INVITE CADETS TO CLAIM EXCLUSIVE PERKS</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Just Claimed Banner */}
          {justClaimed && (
            <View style={styles.claimedBanner}>
              <Text style={styles.claimedBannerText}>
                [PERK UNLOCKED] +500 CREDITS & NITRO BOOST ARMED!
              </Text>
            </View>
          )}

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Vault Balance Status */}
            <View style={styles.vaultPill}>
              <Text style={styles.vaultLabel}>VAULT BALANCE</Text>
              <Text style={styles.vaultValue}>[CR] {credits.toLocaleString()} CREDITS</Text>
            </View>

            {/* Perks & Rewards List */}
            <Text style={styles.sectionHeader}>// REWARDS DELIVERED ON SHARE / INVITE</Text>

            {/* Reward 1: Credits */}
            <View style={styles.rewardCard}>
              <View style={styles.rewardIconBadge}>
                <Text style={styles.rewardIcon}>CR</Text>
              </View>
              <View style={styles.rewardInfo}>
                <View style={styles.rewardTopLine}>
                  <Text style={styles.rewardName}>+500 CYBER CREDITS</Text>
                  <Text style={styles.perkActiveBadge}>INSTANT</Text>
                </View>
                <Text style={styles.rewardDesc}>
                  Used to unlock high-tier interceptor crafts in the Custom Hangar.
                </Text>
              </View>
            </View>

            {/* Reward 2: Exclusive Skin */}
            <View style={[styles.rewardCard, { borderColor: Colors.neonGold }]}>
              <View style={[styles.rewardIconBadge, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                <Text style={[styles.rewardIcon, { color: Colors.neonGold }]}>SHIP</Text>
              </View>
              <View style={styles.rewardInfo}>
                <View style={styles.rewardTopLine}>
                  <Text style={[styles.rewardName, { color: '#FFFFFF' }]}>SOLAR PHOENIX CRAFT</Text>
                  <Text style={[styles.perkActiveBadge, { borderColor: Colors.neonGold }]}>
                    {isSolarGoldUnlocked ? 'UNLOCKED' : 'EXCLUSIVE'}
                  </Text>
                </View>
                <Text style={styles.rewardDesc}>
                  Gilded prestige interceptor with radiant liquid gold wings and golden plasma wake.
                </Text>
              </View>
            </View>

            {/* Reward 3: Temporary Nitro Headstart */}
            <View style={[styles.rewardCard, { borderColor: Colors.neonCyan }]}>
              <View style={[styles.rewardIconBadge, { backgroundColor: 'rgba(0, 240, 255, 0.2)' }]}>
                <Text style={[styles.rewardIcon, { color: Colors.neonCyan }]}>NITRO</Text>
              </View>
              <View style={styles.rewardInfo}>
                <View style={styles.rewardTopLine}>
                  <Text style={styles.rewardName}>4.0s HEADSTART NITRO BOOST</Text>
                  <Text
                    style={[
                      styles.perkActiveBadge,
                      { borderColor: hasHeadstartNitro ? Colors.neonGreen : Colors.neonCyan },
                    ]}
                  >
                    {hasHeadstartNitro ? 'READY FOR NEXT RUN' : 'TEMPORARY PERK'}
                  </Text>
                </View>
                <Text style={styles.rewardDesc}>
                  Starts your next run with instant hypersonic nitro boost (+60% world speed)!
                </Text>
              </View>
            </View>

            {/* Referral Info Box */}
            <View style={styles.inviteBox}>
              <Text style={styles.inviteLabel}>YOUR PILOT RECRUIT CALLSIGN:</Text>
              <View style={styles.callsignPill}>
                <Text style={styles.callsignText}>{gamerTag}</Text>
              </View>
              <Text style={styles.inviteSubtext}>
                Friends who enter your callsign or open your link grant you both bonus credits!
              </Text>
            </View>
          </ScrollView>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleShareAndClaim}
            activeOpacity={0.8}
          >
            <Text style={styles.inviteButtonText}>INVITE CADETS & CLAIM REWARDS ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 4, 14, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    width: '92%',
    maxWidth: 420,
    maxHeight: '88%',
    backgroundColor: 'rgba(12, 14, 30, 0.98)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.neonGold,
    padding: 20,
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: Colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.9,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  claimedBanner: {
    backgroundColor: 'rgba(0, 240, 255, 0.25)',
    borderColor: Colors.neonCyan,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  claimedBannerText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scrollArea: {
    marginVertical: 4,
  },
  vaultPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  vaultLabel: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  vaultValue: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: Colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  sectionHeader: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 10,
    opacity: 0.85,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 20, 42, 0.85)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  rewardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardIcon: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 1,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardName: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  perkActiveBadge: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neonCyan,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rewardDesc: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    color: '#FFFFFF',
    opacity: 0.85,
    lineHeight: 14,
  },
  inviteBox: {
    backgroundColor: 'rgba(10, 10, 24, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  inviteLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 6,
    opacity: 0.8,
  },
  callsignPill: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: Colors.neonCyan,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
  },
  callsignText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  inviteSubtext: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 14,
  },
  inviteButton: {
    backgroundColor: Colors.neonGold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  inviteButtonText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 1.5,
  },
});
