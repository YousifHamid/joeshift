import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import {
  DEFAULT_SKIN_ID,
  SkinId,
  VEHICLE_SKINS,
  VehicleSkin,
} from '../game/VehicleSkins';
import { HapticsManager } from '../audio/HapticsManager';
import { SoundEffects } from '../audio/SoundEffects';

interface HangarModalProps {
  visible: boolean;
  credits: number;
  unlockedSkins: SkinId[];
  equippedSkin: SkinId;
  onEquipSkin: (skinId: SkinId) => Promise<void>;
  onBuySkin: (skinId: SkinId, cost: number) => Promise<boolean>;
  onOpenShareReward: () => void;
  onClose: () => void;
}

export const HangarModal: React.FC<HangarModalProps> = ({
  visible,
  credits,
  unlockedSkins,
  equippedSkin,
  onEquipSkin,
  onBuySkin,
  onOpenShareReward,
  onClose,
}) => {
  const [selectedSkinId, setSelectedSkinId] = useState<SkinId>(equippedSkin || DEFAULT_SKIN_ID);

  const skinList = Object.values(VEHICLE_SKINS);
  const currentSkin: VehicleSkin = VEHICLE_SKINS[selectedSkinId] || VEHICLE_SKINS[DEFAULT_SKIN_ID];
  const isUnlocked = unlockedSkins.includes(selectedSkinId);
  const isEquipped = equippedSkin === selectedSkinId;

  const handleSelect = (id: SkinId) => {
    setSelectedSkinId(id);
    HapticsManager.collect();
  };

  const handleEquip = async () => {
    await onEquipSkin(selectedSkinId);
    HapticsManager.powerUp();
    SoundEffects.playPowerUp();
  };

  const handlePurchase = async () => {
    if (credits < currentSkin.costCredits) {
      HapticsManager.collision();
      Alert.alert(
        'INSUFFICIENT CREDITS',
        `You need ${currentSkin.costCredits} Cyber Credits to unlock ${currentSkin.name}.\n\nInvite friends to JOESHIFT to instantly earn +500 Credits!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Invite & Earn (+500)', onPress: onOpenShareReward },
        ]
      );
      return;
    }

    const success = await onBuySkin(selectedSkinId, currentSkin.costCredits);
    if (success) {
      HapticsManager.stageClear();
      SoundEffects.playStageClear();
      await onEquipSkin(selectedSkinId);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>CUSTOM HANGAR</Text>
              <Text style={styles.subtitle}>EXCLUSIVE VEHICLE SKINS & ARSENAL</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Credits Balance Pill */}
          <View style={styles.vaultPill}>
            <Text style={styles.vaultLabel}>VAULT BALANCE</Text>
            <TouchableOpacity
              style={styles.earnBadge}
              onPress={onOpenShareReward}
              activeOpacity={0.7}
            >
              <Text style={styles.vaultValue}>[CR] {credits.toLocaleString()}</Text>
              <Text style={styles.earnBadgeText}>+ GET MORE</Text>
            </TouchableOpacity>
          </View>

          {/* Skin Selection Horizontal Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorStrip}
          >
            {skinList.map((skin) => {
              const selected = skin.id === selectedSkinId;
              const unlocked = unlockedSkins.includes(skin.id);
              const equipped = equippedSkin === skin.id;

              return (
                <TouchableOpacity
                  key={skin.id}
                  style={[
                    styles.skinTab,
                    selected && { borderColor: skin.accentHex, backgroundColor: 'rgba(255,255,255,0.08)' },
                  ]}
                  onPress={() => handleSelect(skin.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.swatchCircle, { borderColor: skin.accentHex }]}>
                    <View
                      style={[
                        styles.swatchInner,
                        {
                          backgroundColor: skin.accentHex,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.skinTabName,
                      selected && { color: '#FFFFFF', fontWeight: 'bold' },
                    ]}
                    numberOfLines={1}
                  >
                    {skin.name}
                  </Text>
                  <Text style={styles.statusBadge}>
                    {equipped ? 'EQUIPPED' : unlocked ? 'OWNED' : 'LOCKED'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selected Skin Detailed Showcase Card */}
          <View style={[styles.showcaseCard, { borderColor: currentSkin.accentHex }]}>
            {/* Visual Craft Silhouette & Plasma Effect Preview */}
            <View style={styles.craftPreviewBox}>
              <View
                style={[
                  styles.craftGlowRing,
                  { borderColor: currentSkin.accentHex, shadowColor: currentSkin.accentHex },
                ]}
              >
                <Text style={[styles.craftIcon, { color: currentSkin.accentHex }]}>▲</Text>
              </View>

              {/* Color Swatch Indicators */}
              <View style={styles.swatchRow}>
                <View style={styles.paletteChip}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: `rgba(${Math.floor(currentSkin.palette.wingColor[0] * 255)}, ${Math.floor(currentSkin.palette.wingColor[1] * 255)}, ${Math.floor(currentSkin.palette.wingColor[2] * 255)}, 1)`,
                      },
                    ]}
                  />
                  <Text style={styles.dotLabel}>WINGS</Text>
                </View>

                <View style={styles.paletteChip}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: `rgba(${Math.floor(currentSkin.palette.armorColor[0] * 255)}, ${Math.floor(currentSkin.palette.armorColor[1] * 255)}, ${Math.floor(currentSkin.palette.armorColor[2] * 255)}, 1)`,
                      },
                    ]}
                  />
                  <Text style={styles.dotLabel}>ARMOR</Text>
                </View>

                <View style={styles.paletteChip}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: `rgba(${Math.floor(currentSkin.palette.finColor[0] * 255)}, ${Math.floor(currentSkin.palette.finColor[1] * 255)}, ${Math.floor(currentSkin.palette.finColor[2] * 255)}, 1)`,
                      },
                    ]}
                  />
                  <Text style={styles.dotLabel}>PLASMAS</Text>
                </View>
              </View>
            </View>

            {/* Info */}
            <View style={styles.skinDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.skinTitle}>{currentSkin.name}</Text>
                <View
                  style={[
                    styles.rarityBadge,
                    { borderColor: currentSkin.accentHex },
                  ]}
                >
                  <Text style={styles.rarityText}>{currentSkin.badge}</Text>
                </View>
              </View>

              <Text style={styles.skinTagline}>{currentSkin.tagline}</Text>
              <Text style={styles.skinDesc}>{currentSkin.description}</Text>
            </View>
          </View>

          {/* Action Button Row */}
          <View style={styles.actionSection}>
            {isEquipped ? (
              <View style={styles.equippedButton}>
                <Text style={styles.equippedButtonText}>★ ACTIVE CRAFT EQUIPPED ★</Text>
              </View>
            ) : isUnlocked ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.neonCyan }]}
                onPress={handleEquip}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>EQUIP VEHICLE</Text>
              </TouchableOpacity>
            ) : currentSkin.unlockWithShare ? (
              <View style={styles.dualActionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1.2, backgroundColor: Colors.neonGold }]}
                  onPress={onOpenShareReward}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.actionBtnText, { color: '#000000' }]}>
                    UNLOCK VIA INVITE
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 0.9, backgroundColor: 'rgba(255,255,255,0.12)' }]}
                  onPress={handlePurchase}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>BUY 500 CR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: currentSkin.accentHex }]}
                onPress={handlePurchase}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    currentSkin.id === 'SOLAR_GOLD' || currentSkin.id === 'EMERALD_VIPER'
                      ? { color: '#06060F' }
                      : { color: '#FFFFFF' },
                  ]}
                >
                  UNLOCK FOR {currentSkin.costCredits} CREDITS
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: 'rgba(12, 14, 30, 0.98)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    padding: 20,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.3)',
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: Colors.neonCyan,
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
  vaultPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.35)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  vaultLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  earnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vaultValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  earnBadgeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.neonGold,
    letterSpacing: 0.5,
  },
  selectorStrip: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 14,
  },
  skinTab: {
    width: 96,
    backgroundColor: 'rgba(18, 20, 42, 0.8)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    alignItems: 'center',
  },
  swatchCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  swatchInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  skinTabName: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  showcaseCard: {
    backgroundColor: 'rgba(16, 18, 38, 0.95)',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  craftPreviewBox: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(6, 6, 16, 0.7)',
    borderRadius: 10,
    marginBottom: 12,
  },
  craftGlowRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },
  craftIcon: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: '900',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 14,
  },
  paletteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  dotLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  skinDetails: {
    marginTop: 4,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  skinTitle: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  rarityBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rarityText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  skinTagline: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.85,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  skinDesc: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 15,
  },
  actionSection: {
    marginTop: 2,
  },
  equippedButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: Colors.neonCyan,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  equippedButtonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  actionBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 1.5,
  },
  dualActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
